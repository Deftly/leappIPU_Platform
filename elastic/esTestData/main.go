package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"os"
	"strings"
	"time"

	"github.com/elastic/go-elasticsearch/esapi"
	"github.com/elastic/go-elasticsearch/v8"
)

type Document struct {
	FailedValidation  bool      `json:"failed_validation"`
	Region            string    `json:"region"`
	ID                string    `json:"id"`
	WorkflowType      string    `json:"workflow_type"`
	Jobs              []Job     `json:"jobs"`
	Failed            bool      `json:"failed"`
	Type              string    `json:"type"`
	Release           string    `json:"release"`
	Started           time.Time `json:"started"`
	Finished          time.Time `json:"finished"`
	Limit             string    `json:"limit"`
	AutomationFailure bool      `json:"automation_failure"`
	WorkflowDone      bool      `json:"workflow_done"`
}

type Job struct {
	ID          int            `json:"id,omitempty"`
	Type        string         `json:"type,omitempty"`
	Created     time.Time      `json:"created,omitempty"`
	Name        string         `json:"name,omitempty"`
	Status      string         `json:"status,omitempty"`
	Failed      *bool          `json:"failed,omitempty"`
	Started     time.Time      `json:"started,omitempty"`
	Finished    time.Time      `json:"finished,omitempty"`
	Elapsed     float64        `json:"elapsed,omitempty"`
	Limit       string         `json:"limit,omitempty"`
	ExtraVars   ExtraVars      `json:"extra_vars,omitempty"`
	Timeout     int            `json:"timeout,omitempty"`
	Release     []string       `json:"release,omitempty"`
	TimedOut    *bool          `json:"timed_out,omitempty"`
	FailedTasks *[]interface{} `json:"failed_tasks,omitempty"`
}

type ExtraVars struct {
	MajorWorkflow          string `json:"major_workflow,omitempty"`
	ReportMode             *bool  `json:"report_mode,omitempty"`
	NextRHELMajorVersion   string `json:"next_rhel_major_version,omitempty"`
	NetworkZoneType        string `json:"networkZoneType,omitempty"`
	TxID                   string `json:"txId,omitempty"`
	DeploymentEnvironment  string `json:"deployment_environment,omitempty"`
	SubWorkflow            string `json:"sub_workflow,omitempty"`
	FinalRHELMajorVersion  string `json:"final_rhel_major_version,omitempty"`
	SubUUID                string `json:"sub_uuid,omitempty"`
	CurrentRHELVersion     string `json:"current_rhel_version,omitempty"`
	SolutionResourceUUID   string `json:"solutionResource_uuid,omitempty"`
	ChangefileTasksFrom    string `json:"changefile_tasks_from,omitempty"`
	ChangefileIncludedRole string `json:"changefile_included_role,omitempty"`
	OobURI                 string `json:"oob_uri,omitempty"`
	BackupTaskfile         string `json:"backup_taskfile,omitempty"`
	BackupServer           string `json:"backup_server,omitempty"`
	AdJoinType             string `json:"ad_join_type,omitempty"`
	FQDN                   string `json:"FQDN,omitempty"`
}

type ReportDocument struct {
	Hostname   string `json:"hostname"`
	JobID      string `json:"job_id"`
	ReportType string `json:"report_type"`
	Timestamp  string `json:"timestamp"`
	RunTime    string `json:"run_time"`
	Report     Report `json:"report"`
}

type Report struct {
	Inhibitors       []Inhibitor        `json:"inhibitors,omitempty"`
	OperationalCheck []OperationalCheck `json:"operational_check,omitempty"`
}

type Inhibitor struct {
	Message                    string `json:"message,omitempty"`
	MitigatedByLeappAutomation string `json:"mitigated_by_leapp_automation,omitempty"`
	Summary                    string `json:"summary,omitempty"`
	Title                      string `json:"title,omitempty"`
}

type OperationalCheck struct {
	Data    OperationalCheckData `json:"data,omitempty"`
	Name    string               `json:"name,omitempty"`
	Passed  bool                 `json:"passed,omitempty"`
	Details string               `json:"details,omitempty"`
}

type OperationalCheckData struct {
	RHELSupported                               bool       `json:"rhel_supported,omitempty"`
	Discovered                                  Discovered `json:"discovered,omitempty"`
	LeappRequiredMib                            string     `json:"leapp_required_mib,omitempty"`
	LvRequiredMib                               string     `json:"lv_required_mib,omitempty"`
	Mount                                       string     `json:"mount,omitempty"`
	Msg                                         []string   `json:"msg,omitempty"`
	Params                                      Params     `json:"params,omitempty"`
	RHELSupportedReason                         string     `json:"rhel_supported_reason,omitempty"`
	SizeNeeded                                  string     `json:"size_needed,omitempty"`
	SpaceReturnedByRemovingPatchSnapshots       string     `json:"space_returned_by_removing_patch_snapshots,omitempty"`
	SpaceReturnedByRemovingPatchingSnapshotsMib string     `json:"space_returned_by_removing_patching_snapshots_mib,omitempty"`
	VgAvailableSpaceMib                         string     `json:"vg_available_space_mib,omitempty"`
	VgUsed                                      string     `json:"vg_used,omitempty"`
	Volgrp                                      string     `json:"volgrp,omitempty"`
}

type Discovered struct {
	PlatformType   string `json:"platform_type,omitempty"`
	ProductVersion string `json:"product_version,omitempty"`
	VMVersion      string `json:"vm_version,omitempty"`
}

type Params struct {
	MinimumVMVersion  string `json:"minimum_vm_version,omitempty"`
	RHELTargetVersion string `json:"rhel_target_version,omitempty"`
}

func main() {
	// Create a new Elasticsearch client
	es, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
	})
	if err != nil {
		log.Fatalf("Error creating the client: %s", err)
	}

	// Create an index template for rhel_upgrade_reporting
	indexTemplate := `{
        "index_patterns": ["rhel_upgrade_reporting*"],
        "mappings": {
            "properties": {
                "jobs": {
                    "type": "nested"
                }
            }
        }
    }`

	// Create an index template for rhel-reports-summary
	reportIndexTemplate := `{
        "index_patterns": ["rhel-reports-summary*"],
        "mappings": {
            "properties": {
                "hostname": {"type": "keyword"},
                "job_id": {"type": "keyword"},
                "report_type": {"type": "keyword"},
                "timestamp": {"type": "keyword"},
                "run_time": {"type": "keyword"},
                "report.inhibitors.message": {"type": "text"},
                "report.inhibitors.mitigated_by_leapp_automation": {"type": "keyword"},
                "report.inhibitors.summary": {"type": "text"},
                "report.inhibitors.title": {"type": "text"},
                "report.operational_check.data.rhel_supported": {"type": "boolean"},
                "report.operational_check.name": {"type": "keyword"},
                "report.operational_check.passed": {"type": "boolean"},
                "report.operational_check.data.discovered.platform_type": {"type": "keyword"},
                "report.operational_check.data.discovered.product_version": {"type": "keyword"},
                "report.operational_check.data.discovered.vm_version": {"type": "keyword"},
                "report.operational_check.data.leapp_required_mib": {"type": "keyword"},
                "report.operational_check.data.lv_required_mib": {"type": "keyword"},
                "report.operational_check.data.mount": {"type": "keyword"},
                "report.operational_check.data.msg": {"type": "keyword"},
                "report.operational_check.data.params.minimum_vm_version": {"type": "keyword"},
                "report.operational_check.data.params.rhel_target_version": {"type": "keyword"},
                "report.operational_check.data.rhel_supported_reason": {"type": "keyword"},
                "report.operational_check.data.size_needed": {"type": "keyword"},
                "report.operational_check.data.space_returned_by_removing_patch_snapshots": {"type": "keyword"},
                "report.operational_check.data.space_returned_by_removing_patching_snapshots_mib": {"type": "keyword"},
                "report.operational_check.data.vg_available_space_mib": {"type": "keyword"},
                "report.operational_check.data.vg_used": {"type": "keyword"},
                "report.operational_check.data.volgrp": {"type": "keyword"},
                "report.operational_check.details": {"type": "text"}
            }
        }
    }`

	// Delete any existing indices matching the pattern
	req := esapi.IndicesDeleteRequest{
		Index: []string{"rhel_upgrade_reporting*", "rhel-reports-summary*"},
	}

	_, err = req.Do(context.Background(), es)
	if err != nil {
		log.Printf("Error deleting old indices: %s", err)
	}

	// Create the index templates
	res, err := es.Indices.PutTemplate(
		"rhel_upgrade_reporting_template",
		strings.NewReader(indexTemplate),
	)
	if err != nil {
		log.Fatalf("Error creating index template: %s", err)
	}
	defer res.Body.Close()

	res, err = es.Indices.PutTemplate(
		"rhel_reports_summary_template",
		strings.NewReader(reportIndexTemplate),
	)
	if err != nil {
		log.Fatalf("Error creating index template: %s", err)
	}
	defer res.Body.Close()

	// Read the document data from a file
	data, err := os.ReadFile("documents.json")
	if err != nil {
		log.Fatalf("Error reading document data: %s", err)
	}

	// Unmarshal the JSON data into a slice of Document structs
	var documents []Document
	err = json.Unmarshal(data, &documents)
	if err != nil {
		log.Fatalf("Error unmarshaling document data: %s", err)
	}

	// Iterate over the documents and index them in Elasticsearch
	for _, doc := range documents {
		// Marshal the document to JSON
		docJSON, err := json.Marshal(doc)
		if err != nil {
			log.Printf("Error marshaling document: %s", err)
			continue
		}

		// Push the document to Elasticsearch
		res, err := es.Index(
			"rhel_upgrade_reporting",
			bytes.NewReader(docJSON),
			es.Index.WithRefresh("true"),
		)
		if err != nil {
			log.Printf("Error indexing document: %s", err)
			continue
		}
		defer res.Body.Close()

		if res.IsError() {
			log.Printf("Error indexing document: %s", res.String())
		} else {
			var r map[string]interface{}
			if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
				log.Printf("Error parsing response: %s", err)
			} else {
				log.Printf("Indexed document with ID %s", r["_id"])
			}
		}
	}

	// Read the report data from a file
	reportData, err := os.ReadFile("report_docs.json")
	if err != nil {
		log.Fatalf("Error reading report data: %s", err)
	}

	// Unmarshal the JSON data into a slice of ReportDocument structs
	var reportDocuments []ReportDocument
	err = json.Unmarshal(reportData, &reportDocuments)
	if err != nil {
		log.Fatalf("Error unmarshaling report data: %s", err)
	}

	// Iterate over the report documents and index them in Elasticsearch
	for _, reportDoc := range reportDocuments {
		reportDocJSON, err := json.Marshal(reportDoc)
		if err != nil {
			log.Printf("Error marshaling report document: %s", err)
			continue
		}

		res, err := es.Index(
			"rhel-reports-summary",
			bytes.NewReader(reportDocJSON),
			es.Index.WithRefresh("true"),
		)
		if err != nil {
			log.Printf("Error indexing report document: %s", err)
			continue
		}
		defer res.Body.Close()

		if res.IsError() {
			log.Printf("Error indexing report document: %s", res.String())
		} else {
			var r map[string]interface{}
			if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
				log.Printf("Error parsing response: %s", err)
			} else {
				log.Printf("Indexed report document with ID %s", r["_id"])
			}
		}
	}
}
