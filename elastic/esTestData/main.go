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

func main() {
	// Create a new Elasticsearch client
	es, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
	})
	if err != nil {
		log.Fatalf("Error creating the client: %s", err)
	}

	// Create an index template
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

	// Delete any existing indices matching the pattern
	req := esapi.IndicesDeleteRequest{
		Index: []string{"rhel_upgrade_reporting*"},
	}

	_, err = req.Do(context.Background(), es)
	if err != nil {
		log.Printf("Error deleting old indices: %s", err)
	}

	// Create the index template
	res, err := es.Indices.PutTemplate(
		"rhel_upgrade_reporting_template",
		strings.NewReader(indexTemplate),
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
}
