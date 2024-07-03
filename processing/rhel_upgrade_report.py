from datetime import datetime, timedelta
import json
import pytz
import re
import requests

from elasticsearch import helpers, Elasticsearch
from openpyxl import Workbook
from openpyxl.worksheet.table import Table
import pandas as pd

import processing.rhel_upgrade_ingestion as ingest

_PATTERN = re.compile(r'[^\sa-zA-Z0-9%&()+*#$@{}\[\]:;<>,.\\/-]')

def get_playbook_type(play):
    if 'changefile_included_role' in play["extra_vars"]:
        if 'rollback' in play["extra_vars"]['changefile_tasks_from']:
            return 'rollback'
        else:
            return play["extra_vars"]['changefile_included_role']
    elif 'backup_taskfile' in play["extra_vars"]:
        return play["extra_vars"]['backup_taskfile']
    elif 'operational' in play['name']:
        return f'operational_check_{play["extra_vars"]["current_rhel_version"]}_to_{play["extra_vars"]["final_rhel_major_version"]}'
    else:
        return 'unknown'

def generate_report():
    es_client = Elasticsearch(ingest._ENVIRONMENTS['amrs']['elk'])
    start_time = datetime(month=6, day=17, hour=0, year=2024, minute=0, second=0, tzinfo=pytz.utc)
    data = get_week_data(es_client, start_time)
    leapp_stat_workbook = Workbook()
    workbook = f"test.xlsx"
    leapp_stat_workbook.save(workbook)
    print("Created workbook: ", workbook)

    workflow_records = []
    failed_tasks_records = []
    for datum in data: 
        source = datum["_source"]

        failed_tasks = []
        [failed_tasks.extend(i['failed_tasks']) for i in source['jobs']]

        workflow = {
            'id': source['id'], 
            'workflow_type': source['workflow_type'], 
            'limit': source['limit'],
            'failed': source['failed'],
            'region': source['region'], 
            'release': source['release'],
            'failed_validation': source['failed_validation'], 
            'automation_failure': source['automation_failure'],
            'started': source['started'],
            'finished': source['finished'],
            'jobs': [i['id'] for i in source["jobs"]],
            'failed_tasks': [i['id'] for i in failed_tasks],
            'Failure Reason': "Timed Out" if any([k['timed_out'] for k in source['jobs']]) else f'=_xlfn.FILTER(FailedTasks[task], (FailedTasks[workflow_id] = "{ source["id"] }") * (FailedTasks[Primary Failure] = 1), "")',
            'Automation Failure': "Other" if any([k['timed_out'] for k in source['jobs']]) else "Not Failed" if not source['failed'] else f'=IF(_xlfn.FILTER(FailedTasks[Failure Type], (FailedTasks[workflow_id] = "{ source["id"] }") * (FailedTasks[Primary Failure] = 1), "-1") = 2, "Not prepared", IF(_xlfn.FILTER(FailedTasks[Failure Type], (FailedTasks[workflow_id] = "{ source["id"] }") * (FailedTasks[Primary Failure] = 1), "-1") = 1, "Other", IF(_xlfn.FILTER(FailedTasks[Failure Type], (FailedTasks[workflow_id] = "{ source["id"] }") * (FailedTasks[Primary Failure] = 1), "-1") = 0, "Automation Failure", "Unknown")))'
        }
        workflow_records.append(workflow)

        for playbook in source["jobs"]:

            for ft in playbook["failed_tasks"]:

                failed_task = {
                    'workflow_id': source['id'], 
                    'workflow_type': source['workflow_type'], 
                    'workflow_failed': source['failed'],
                    'playbook': get_playbook_type(playbook),
                    'automation_failure': source['automation_failure'],
                    'workflow_region': source['region'],
                    'limit': source['limit'],
                    'id': ft['id'],
                    'job_id': ft['job'],
                    'task': ft['task'],
                    'action': ft['event_data']['resolved_action'] if 'resolved_action' in ft['event_data'] else None,
                    'duration': ft['event_data']['duration'] if 'duration' in ft['event_data'] else None,
                    'stdout': re.sub(_PATTERN, "", ft['stdout'].replace('\\n','\n')),
                    'event': ft['event_display'],
                    'ignored': ft['event_data']['ignore_errors'] if 'ignore_errors' in ft['event_data'] else None,
                    'args': ft['event_data']['task_args'] if 'task_args' in ft['event_data'] else None,
                    'res': ft['event_data']['res'] if 'res' in ft['event_data'] else None,
                    'path': ft['event_data']['task_path'] if 'task_path' in ft['event_data'] else None,
                    'role': ft['role'],
                    'created': ft['created'],
                    'start': ft['event_data']['start'] if 'start' in ft['event_data'] else None,
                    'end': ft['event_data']['end'] if 'end' in ft['event_data'] else None,
                    'failed': ft['failed'],
                    'changed': ft['changed'],
                    'event_level': ft['event_level'],
                    'Primary Failure': 0,
                    'Not Mitigated by Future Release': 1,
                    'Failure Type': -1 # 0 = automation failure, 1 = other, 2 = not ready, -1 Unset
                }

                failed_tasks_records.append(failed_task)

    with pd.ExcelWriter('./test.xlsx', mode='a', engine="openpyxl") as writer:
        export_data = pd.DataFrame.from_records(failed_tasks_records)

        for field in ["start", "end", "created"]:
            export_data[field] = pd.to_datetime(export_data[field])
            export_data[field] = export_data[field].apply(lambda x: x.tz_localize(None)) 
        
        export_data.to_excel(writer, sheet_name=f"Failed Tasks", startrow=0, header=True, index=False)
        (max_row, max_col) = export_data.shape
        table = Table(ref=f'A1:AB{max_row+1}', displayName='FailedTasks')
        writer.sheets['Failed Tasks'].add_table(table)

        export_data = pd.DataFrame.from_records(workflow_records)

        for field in ["started", "finished"]:
            export_data[field] = pd.to_datetime(export_data[field])
            export_data[field] = export_data[field].apply(lambda x: x.tz_localize(None)) 
        
        export_data.to_excel(writer, sheet_name=f"Workflows", startrow=0, header=True, index=False)
        (max_row, max_col) = export_data.shape
        table = Table(ref=f'A1:N{max_row+1}', displayName='Workflows')
        writer.sheets['Workflows'].add_table(table)

def elk_search(es_client, body):
    """Generalized function to perform a search

    @Param: es_client - Elasticsearch - Elasticsearch client object
    @Param: body - string - Elasticsearch query

    @Return: dict - Hits returned
    """

    try:
        result = dict(es_client.search(index=ingest._ES_INDEX, body=body, scroll='1d'))
        return result
    except Exception as e:
        print(f'Error occurred: {e}')

def get_week_data(es_client, start_time):
    """Return last time data was uploaded for region

    @Param: es_client - Elasticsearch - Elasticsearch client object
    @Param: region - string - Region

    @Return: string - last time
    """
    end_time = start_time + timedelta(days=7)
    body = {
        "size": 10000,
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "finished": {
                                "gte": start_time,
                                "lte": end_time
                            }
                        }
                    }
                ]
            }
        },
        "_source": True
    }
    results = []
    scroll_id = None
    data = elk_search(es_client, body)
    if scroll_id is None and '_scroll_id' in data:
        scroll_id = data['_scroll_id']

    scroll_query = {
        'scroll': '1d'
    }

    while len(data['hits']['hits']) > 0:
        results.extend(data['hits']['hits'])
        data = es_client.scroll(scroll_id=scroll_id, body=scroll_query)
    return results