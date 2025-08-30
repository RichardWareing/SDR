# Infrastructure & DevOps Standards
## SDR Management System Operations Guide

**Document Version:** 1.0  
**Date:** August 30, 2025  
**Author:** DevOps Lead / Infrastructure Architect  
**Project:** SDR Management System Infrastructure Standards  

---

## 1. Executive Summary

This document establishes the infrastructure and DevOps standards for the SDR Management System, including naming conventions, resource provisioning templates, deployment pipelines, monitoring standards, and operational procedures. These standards ensure consistency, reliability, and maintainability across all environments.

---

## 2. Azure Resource Naming Conventions

### 2.1 Naming Pattern Standards

```typescript
// Naming Convention Pattern: {resource-type}-{application}-{environment}-{region}-{instance}
const namingConventions = {
  pattern: "{resourceType}-{app}-{env}-{region}-{instance?}",
  
  examples: {
    resourceGroup: "rg-sdr-prod-eastus",
    storageAccount: "stsdrprodeastus001",  // Storage accounts: no hyphens, max 24 chars
    functionApp: "func-sdr-prod-eastus",
    staticWebApp: "swa-sdr-prod-eastus",
    keyVault: "kv-sdr-prod-eastus",
    applicationInsights: "ai-sdr-prod-eastus",
    botService: "bot-sdr-prod-eastus",
    applicationGateway: "agw-sdr-prod-eastus",
    logAnalytics: "law-sdr-prod-eastus"
  }
};

// Environment Codes
const environmentCodes = {
  development: "dev",
  testing: "test", 
  userAcceptance: "uat",
  staging: "stage",
  production: "prod"
};

// Region Codes
const regionCodes = {
  "East US": "eastus",
  "East US 2": "eastus2",
  "West US 2": "westus2",
  "West Europe": "westeu",
  "North Europe": "northeu"
};
```

### 2.2 Resource-Specific Naming Standards

| Resource Type | Prefix | Example | Notes |
|---------------|--------|---------|-------|
| Resource Group | `rg-` | `rg-sdr-prod-eastus` | Container for all resources |
| Function App | `func-` | `func-sdr-prod-eastus` | Serverless compute |
| Static Web App | `swa-` | `swa-sdr-prod-eastus` | Frontend hosting |
| Storage Account | `st` | `stsdrprodeastus001` | No hyphens, lowercase, max 24 chars |
| Key Vault | `kv-` | `kv-sdr-prod-eastus` | Secrets management |
| Application Insights | `ai-` | `ai-sdr-prod-eastus` | Monitoring and telemetry |
| Log Analytics Workspace | `law-` | `law-sdr-prod-eastus` | Centralized logging |
| Application Gateway | `agw-` | `agw-sdr-prod-eastus` | Load balancer and WAF |
| Bot Service | `bot-` | `bot-sdr-prod-eastus` | Teams Bot hosting |
| Event Grid Topic | `egt-` | `egt-sdr-prod-eastus` | Event routing |
| Logic App | `la-` | `la-sdr-email-prod-eastus` | Workflow automation |

### 2.3 Tagging Standards

```json
{
  "standardTags": {
    "Application": "SDR-Management-System",
    "Environment": "Production|Staging|Testing|Development",
    "Owner": "Development-Team",
    "CostCenter": "IT-001",
    "Project": "SDR-001",
    "Version": "1.0.0",
    "Criticality": "High|Medium|Low",
    "BackupRequired": "Yes|No",
    "MonitoringLevel": "Critical|Standard|Basic",
    "DataClassification": "Internal|Confidential|Public",
    "CreatedDate": "YYYY-MM-DD",
    "CreatedBy": "user@company.com"
  },
  
  "exampleUsage": {
    "tags": {
      "Application": "SDR-Management-System",
      "Environment": "Production", 
      "Owner": "Development-Team",
      "CostCenter": "IT-001",
      "Project": "SDR-001",
      "Version": "1.2.0",
      "Criticality": "High",
      "BackupRequired": "Yes",
      "MonitoringLevel": "Critical",
      "DataClassification": "Confidential",
      "CreatedDate": "2025-08-30",
      "CreatedBy": "devops@company.com"
    }
  }
}
```

---

## 3. Infrastructure as Code (IaC) Templates

### 3.1 Bicep Template Structure

```bicep
// main.bicep - Master template
@description('Environment name (dev, test, uat, prod)')
param environment string

@description('Azure region for deployment')
param location string = resourceGroup().location

@description('Application version')
param appVersion string

@description('Enable monitoring and logging')
param enableMonitoring bool = true

// Variables
var appName = 'sdr'
var resourceSuffix = '${appName}-${environment}-${location}'

// Resource Group (deployed at subscription level)
targetScope = 'subscription'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${resourceSuffix}'
  location: location
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    Version: appVersion
    CreatedDate: utcNow('yyyy-MM-dd')
  }
}

// Deploy core infrastructure
module coreInfrastructure 'modules/core-infrastructure.bicep' = {
  name: 'core-infrastructure'
  scope: resourceGroup
  params: {
    environment: environment
    location: location
    resourceSuffix: resourceSuffix
    enableMonitoring: enableMonitoring
  }
}

// Deploy application services
module applicationServices 'modules/application-services.bicep' = {
  name: 'application-services'
  scope: resourceGroup
  dependsOn: [
    coreInfrastructure
  ]
  params: {
    environment: environment
    location: location
    resourceSuffix: resourceSuffix
    storageAccountName: coreInfrastructure.outputs.storageAccountName
    keyVaultName: coreInfrastructure.outputs.keyVaultName
  }
}

// Outputs
output resourceGroupName string = resourceGroup.name
output storageAccountName string = coreInfrastructure.outputs.storageAccountName
output functionAppName string = applicationServices.outputs.functionAppName
output staticWebAppName string = applicationServices.outputs.staticWebAppName
```

### 3.2 Core Infrastructure Module

```bicep
// modules/core-infrastructure.bicep
@description('Environment name')
param environment string

@description('Location for resources')
param location string

@description('Resource naming suffix')
param resourceSuffix string

@description('Enable monitoring')
param enableMonitoring bool

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: replace('st${resourceSuffix}', '-', '')  // Remove hyphens for storage
  location: location
  sku: {
    name: environment == 'prod' ? 'Standard_ZRS' : 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    defaultToOAuthAuthentication: true
    encryption: {
      services: {
        blob: {
          enabled: true
          keyType: 'Account'
        }
        file: {
          enabled: true
          keyType: 'Account'
        }
      }
      keySource: 'Microsoft.Storage'
    }
    minimumTlsVersion: 'TLS1_2'
    networkAcls: {
      defaultAction: 'Allow'  // Configure as needed
      bypass: 'AzureServices'
    }
    supportsHttpsTrafficOnly: true
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Storage'
    BackupRequired: 'Yes'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: 'kv-${resourceSuffix}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Security'
    Criticality: 'High'
  }
}

// Log Analytics Workspace (if monitoring enabled)
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = if (enableMonitoring) {
  name: 'law-${resourceSuffix}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: environment == 'prod' ? 90 : 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Monitoring'
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = if (enableMonitoring) {
  name: 'ai-${resourceSuffix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: enableMonitoring ? logAnalyticsWorkspace.id : null
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Monitoring'
  }
}

// Outputs
output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output keyVaultName string = keyVault.name
output keyVaultId string = keyVault.id
output applicationInsightsName string = enableMonitoring ? applicationInsights.name : ''
output applicationInsightsKey string = enableMonitoring ? applicationInsights.properties.InstrumentationKey : ''
output logAnalyticsWorkspaceId string = enableMonitoring ? logAnalyticsWorkspace.id : ''
```

### 3.3 Application Services Module

```bicep
// modules/application-services.bicep
@description('Environment name')
param environment string

@description('Location for resources')
param location string

@description('Resource naming suffix')
param resourceSuffix string

@description('Storage account name')
param storageAccountName string

@description('Key Vault name')
param keyVaultName string

// App Service Plan for Function App
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'asp-${resourceSuffix}'
  location: location
  sku: {
    name: environment == 'prod' ? 'EP1' : 'Y1'  // Premium for prod, Consumption for dev/test
    tier: environment == 'prod' ? 'ElasticPremium' : 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: false  // Windows hosting
    targetWorkerCount: environment == 'prod' ? 3 : 1
    targetWorkerSizeId: environment == 'prod' ? 1 : 0
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Compute'
  }
}

// Function App
resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: 'func-${resourceSuffix}'
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${listKeys(resourceId('Microsoft.Storage/storageAccounts', storageAccountName), '2022-09-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${listKeys(resourceId('Microsoft.Storage/storageAccounts', storageAccountName), '2022-09-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower('func-${resourceSuffix}')
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
          'https://*.azurestaticapps.net'
        ]
        supportCredentials: false
      }
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      netFrameworkVersion: 'v6.0'
      use32BitWorkerProcess: false
    }
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Compute'
    Criticality: 'High'
  }
}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: 'swa-${resourceSuffix}'
  location: location
  sku: {
    name: environment == 'prod' ? 'Standard' : 'Free'
    tier: environment == 'prod' ? 'Standard' : 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      apiLocation: 'api'
      outputLocation: 'build'
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Enabled'
  }
  
  tags: {
    Application: 'SDR-Management-System'
    Environment: environment
    ResourceType: 'Web'
  }
}

// Grant Function App access to Key Vault
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2022-07-01' = {
  name: '${keyVaultName}/add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: functionApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

// Outputs
output functionAppName string = functionApp.name
output functionAppId string = functionApp.id
output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output appServicePlanId string = appServicePlan.id
```

---

## 4. CI/CD Pipeline Standards

### 4.1 Azure DevOps Pipeline Structure

```yaml
# azure-pipelines.yml - Multi-stage pipeline
trigger:
  branches:
    include:
      - main
      - develop
      - feature/*
  paths:
    exclude:
      - docs/*
      - README.md

pr:
  branches:
    include:
      - main
      - develop

variables:
  - group: SDR-Common-Variables
  - name: buildConfiguration
    value: 'Release'
  - name: nodeVersion
    value: '18.x'

stages:
  - stage: Build
    displayName: 'Build Stage'
    jobs:
      - job: BuildFrontend
        displayName: 'Build React Frontend'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            displayName: 'Setup Node.js'
            inputs:
              versionSpec: $(nodeVersion)
          
          - task: Cache@2
            displayName: 'Cache npm packages'
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: ~/.npm
          
          - script: |
              cd frontend
              npm ci
              npm run build
              npm run test:ci
            displayName: 'Install dependencies, build, and test'
          
          - task: PublishTestResults@2
            displayName: 'Publish test results'
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'frontend/coverage/junit.xml'
              mergeTestResults: true
          
          - task: PublishCodeCoverageResults@1
            displayName: 'Publish code coverage'
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: 'frontend/coverage/cobertura-coverage.xml'
          
          - task: ArchiveFiles@2
            displayName: 'Archive frontend build'
            inputs:
              rootFolderOrFile: 'frontend/build'
              includeRootFolder: false
              archiveType: 'zip'
              archiveFile: '$(Build.ArtifactStagingDirectory)/frontend.zip'
          
          - task: PublishBuildArtifacts@1
            displayName: 'Publish frontend artifacts'
            inputs:
              pathtoPublish: '$(Build.ArtifactStagingDirectory)/frontend.zip'
              artifactName: 'frontend'

      - job: BuildBackend
        displayName: 'Build Azure Functions'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            displayName: 'Setup Node.js'
            inputs:
              versionSpec: $(nodeVersion)
          
          - script: |
              cd functions
              npm ci
              npm run build
              npm run test:ci
            displayName: 'Install dependencies, build, and test'
          
          - task: PublishTestResults@2
            displayName: 'Publish test results'
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'functions/coverage/junit.xml'
              mergeTestResults: true
          
          - task: ArchiveFiles@2
            displayName: 'Archive function app'
            inputs:
              rootFolderOrFile: 'functions'
              includeRootFolder: false
              archiveType: 'zip'
              archiveFile: '$(Build.ArtifactStagingDirectory)/functions.zip'
          
          - task: PublishBuildArtifacts@1
            displayName: 'Publish function artifacts'
            inputs:
              pathtoPublish: '$(Build.ArtifactStagingDirectory)/functions.zip'
              artifactName: 'functions'

      - job: BuildInfrastructure
        displayName: 'Validate Infrastructure'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: AzureCLI@2
            displayName: 'Validate Bicep templates'
            inputs:
              azureSubscription: 'SDR-ServiceConnection'
              scriptType: 'bash'
              scriptLocation: 'inlineScript'
              inlineScript: |
                az bicep build --file infrastructure/main.bicep
                az deployment group validate \
                  --resource-group rg-sdr-dev-eastus \
                  --template-file infrastructure/main.bicep \
                  --parameters environment=dev
          
          - task: PublishBuildArtifacts@1
            displayName: 'Publish infrastructure artifacts'
            inputs:
              pathtoPublish: 'infrastructure'
              artifactName: 'infrastructure'

  - stage: DeployDev
    displayName: 'Deploy to Development'
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    dependsOn: Build
    variables:
      - group: SDR-Dev-Variables
    jobs:
      - deployment: DeployInfrastructure
        displayName: 'Deploy Infrastructure'
        environment: 'SDR-Development'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureResourceManagerTemplateDeployment@3
                  displayName: 'Deploy Bicep template'
                  inputs:
                    deploymentScope: 'Resource Group'
                    azureResourceManagerConnection: 'SDR-ServiceConnection'
                    resourceGroupName: 'rg-sdr-dev-eastus'
                    location: 'East US'
                    templateLocation: 'Linked artifact'
                    csmFile: '$(Pipeline.Workspace)/infrastructure/main.bicep'
                    csmParametersFile: '$(Pipeline.Workspace)/infrastructure/parameters/dev.json'
                    deploymentMode: 'Incremental'
                    deploymentOutputs: 'armOutputs'

      - deployment: DeployApplications
        displayName: 'Deploy Applications'
        dependsOn: DeployInfrastructure
        environment: 'SDR-Development'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureFunctionApp@1
                  displayName: 'Deploy Function App'
                  inputs:
                    azureSubscription: 'SDR-ServiceConnection'
                    appType: 'functionApp'
                    appName: '$(functionAppName)'
                    package: '$(Pipeline.Workspace)/functions/functions.zip'
                    deploymentMethod: 'zipDeploy'
                
                - task: AzureStaticWebApp@0
                  displayName: 'Deploy Static Web App'
                  inputs:
                    azure_static_web_apps_api_token: '$(staticWebAppToken)'
                    app_location: '/'
                    app_build_command: 'npm run build'
                    output_location: 'build'
                    app_artifact_location: '$(Pipeline.Workspace)/frontend'

  - stage: DeployProd
    displayName: 'Deploy to Production'
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    dependsOn: Build
    variables:
      - group: SDR-Prod-Variables
    jobs:
      - deployment: DeployProduction
        displayName: 'Deploy to Production'
        environment: 'SDR-Production'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                # Same deployment steps as Dev, but with production parameters
                - task: AzureResourceManagerTemplateDeployment@3
                  displayName: 'Deploy Production Infrastructure'
                  inputs:
                    deploymentScope: 'Resource Group'
                    azureResourceManagerConnection: 'SDR-ServiceConnection'
                    resourceGroupName: 'rg-sdr-prod-eastus'
                    location: 'East US'
                    templateLocation: 'Linked artifact'
                    csmFile: '$(Pipeline.Workspace)/infrastructure/main.bicep'
                    csmParametersFile: '$(Pipeline.Workspace)/infrastructure/parameters/prod.json'
                    deploymentMode: 'Incremental'
```

### 4.2 GitHub Actions Alternative

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'
  AZURE_FUNCTIONAPP_PACKAGE_PATH: './functions'
  AZURE_STATICWEBAPP_PACKAGE_PATH: './frontend'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            functions/package-lock.json
      
      - name: Build and test frontend
        run: |
          cd frontend
          npm ci
          npm run build
          npm run test:ci
      
      - name: Build and test functions
        run: |
          cd functions
          npm ci
          npm run build
          npm run test:ci
      
      - name: Upload frontend artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/build
      
      - name: Upload function artifacts
        uses: actions/upload-artifact@v4
        with:
          name: function-build
          path: functions

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v4
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/frontend-build'
          api_location: '/function-build'
      
      - name: Deploy Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: 'func-sdr-dev-eastus'
          package: 'function-build'
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE_DEV }}

  deploy-prod:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      # Similar to deploy-dev but with production secrets and app names
      - name: Deploy to Production
        run: echo "Deploy to production with approval gates"
```

---

## 5. Environment Configuration Standards

### 5.1 Environment-Specific Parameters

```json
// infrastructure/parameters/dev.json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environment": {
      "value": "dev"
    },
    "location": {
      "value": "eastus"
    },
    "appVersion": {
      "value": "1.0.0"
    },
    "enableMonitoring": {
      "value": true
    },
    "skuTier": {
      "value": "Basic"
    },
    "instanceCount": {
      "value": 1
    },
    "enableBackup": {
      "value": false
    },
    "logRetentionDays": {
      "value": 30
    }
  }
}
```

```json
// infrastructure/parameters/prod.json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environment": {
      "value": "prod"
    },
    "location": {
      "value": "eastus"
    },
    "appVersion": {
      "value": "1.0.0"
    },
    "enableMonitoring": {
      "value": true
    },
    "skuTier": {
      "value": "Premium"
    },
    "instanceCount": {
      "value": 3
    },
    "enableBackup": {
      "value": true
    },
    "logRetentionDays": {
      "value": 90
    },
    "enablePrivateEndpoints": {
      "value": true
    },
    "wafPolicy": {
      "value": "Enabled"
    }
  }
}
```

### 5.2 Application Configuration Management

```typescript
// Configuration management pattern
export interface EnvironmentConfig {
  environment: 'development' | 'testing' | 'staging' | 'production';
  azureDevOps: {
    organization: string;
    projects: {
      general: string;
      critical: string;
      external: string;
    };
    patTokenKeyVaultSecret: string;
  };
  ai: {
    openAiEndpoint: string;
    openAiKeyVaultSecret: string;
    formRecognizerEndpoint: string;
    formRecognizerKeyVaultSecret: string;
  };
  storage: {
    connectionStringKeyVaultSecret: string;
    containerNames: {
      attachments: string;
      processing: string;
      exports: string;
    };
  };
  teams: {
    botAppId: string;
    botAppPasswordKeyVaultSecret: string;
    tenantId: string;
  };
  monitoring: {
    applicationInsightsConnectionString: string;
    logLevel: 'Debug' | 'Information' | 'Warning' | 'Error';
    enableTelemetry: boolean;
  };
  features: {
    enableAiProcessing: boolean;
    enableTeamsBot: boolean;
    enableAdvancedAnalytics: boolean;
    maxFileUploadSize: number;
    approvalThresholdHours: number;
  };
}

// Configuration factory
export class ConfigurationService {
  private static configs: Map<string, EnvironmentConfig> = new Map();

  static getConfig(environment?: string): EnvironmentConfig {
    const env = environment || process.env.NODE_ENV || 'development';
    
    if (!this.configs.has(env)) {
      this.configs.set(env, this.loadConfig(env));
    }
    
    return this.configs.get(env)!;
  }

  private static loadConfig(environment: string): EnvironmentConfig {
    const baseConfig: EnvironmentConfig = {
      environment: environment as any,
      azureDevOps: {
        organization: process.env.DEVOPS_ORGANIZATION!,
        projects: {
          general: process.env.DEVOPS_PROJECT_GENERAL || 'SDR-General',
          critical: process.env.DEVOPS_PROJECT_CRITICAL || 'SDR-Critical',
          external: process.env.DEVOPS_PROJECT_EXTERNAL || 'SDR-External'
        },
        patTokenKeyVaultSecret: 'devops-pat-token'
      },
      ai: {
        openAiEndpoint: process.env.OPENAI_ENDPOINT!,
        openAiKeyVaultSecret: 'openai-api-key',
        formRecognizerEndpoint: process.env.FORM_RECOGNIZER_ENDPOINT!,
        formRecognizerKeyVaultSecret: 'form-recognizer-key'
      },
      storage: {
        connectionStringKeyVaultSecret: 'storage-connection-string',
        containerNames: {
          attachments: 'sdr-attachments',
          processing: 'ai-processing',
          exports: 'exports'
        }
      },
      teams: {
        botAppId: process.env.BOT_APP_ID!,
        botAppPasswordKeyVaultSecret: 'bot-app-password',
        tenantId: process.env.TENANT_ID!
      },
      monitoring: {
        applicationInsightsConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!,
        logLevel: environment === 'production' ? 'Information' : 'Debug',
        enableTelemetry: true
      },
      features: this.getFeatureFlags(environment)
    };

    return baseConfig;
  }

  private static getFeatureFlags(environment: string) {
    const prodFeatures = {
      enableAiProcessing: true,
      enableTeamsBot: true,
      enableAdvancedAnalytics: true,
      maxFileUploadSize: 25 * 1024 * 1024, // 25MB
      approvalThresholdHours: 40
    };

    const devFeatures = {
      enableAiProcessing: true,
      enableTeamsBot: false, // May not be configured in dev
      enableAdvancedAnalytics: false,
      maxFileUploadSize: 10 * 1024 * 1024, // 10MB
      approvalThresholdHours: 8
    };

    return environment === 'production' ? prodFeatures : devFeatures;
  }
}
```

---

## 6. Monitoring and Alerting Standards

### 6.1 Application Insights Configuration

```typescript
// Monitoring configuration and custom telemetry
export class MonitoringService {
  private appInsights: TelemetryClient;
  
  constructor() {
    this.appInsights = new TelemetryClient(
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!
    );
    this.setupDefaultProperties();
  }

  private setupDefaultProperties(): void {
    this.appInsights.commonProperties = {
      application: 'SDR-Management-System',
      environment: process.env.NODE_ENV!,
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  // Business metrics
  trackSDRCreated(sdr: any, processingTimeMs: number): void {
    this.appInsights.trackEvent({
      name: 'SDR_Created',
      properties: {
        sourceType: sdr.sourceType,
        priority: sdr.priority,
        customerType: sdr.customerType,
        hasAttachments: sdr.attachments ? 'true' : 'false'
      },
      measurements: {
        processingTimeMs,
        attachmentCount: sdr.attachments?.length || 0
      }
    });
  }

  trackSDRStatusChange(sdrId: string, fromStatus: string, toStatus: string): void {
    this.appInsights.trackEvent({
      name: 'SDR_StatusChanged',
      properties: {
        sdrId,
        fromStatus,
        toStatus,
        statusFlow: `${fromStatus}->${toStatus}`
      }
    });
  }

  trackAIProcessing(sourceType: string, confidence: number, processingTimeMs: number): void {
    this.appInsights.trackEvent({
      name: 'AI_ContentProcessed',
      properties: {
        sourceType,
        confidenceLevel: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
      },
      measurements: {
        confidence,
        processingTimeMs
      }
    });
  }

  // Performance tracking
  trackDependency(name: string, data: string, duration: number, success: boolean): void {
    this.appInsights.trackDependency({
      name,
      data,
      duration,
      success,
      dependencyTypeName: 'HTTP'
    });
  }

  // Error tracking with context
  trackError(error: Error, properties?: { [key: string]: string }): void {
    this.appInsights.trackException({
      exception: error,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: 'SDR-System'
      }
    });
  }
}
```

### 6.2 Alert Rules Configuration

```json
{
  "alertRules": [
    {
      "name": "High Error Rate",
      "description": "Alert when error rate exceeds 5% over 5 minutes",
      "condition": {
        "query": "requests | where timestamp > ago(5m) | summarize error_rate = 100.0 * countif(success != true) / count()",
        "operator": "GreaterThan",
        "threshold": 5,
        "timeAggregation": "Average",
        "frequencyInMinutes": 5,
        "windowSizeInMinutes": 5
      },
      "severity": "Critical",
      "actions": [
        {
          "type": "email",
          "recipients": ["ops-team@company.com", "dev-lead@company.com"]
        },
        {
          "type": "teams",
          "webhookUrl": "https://outlook.office.com/webhook/..."
        }
      ]
    },
    {
      "name": "Slow Response Time",
      "description": "Alert when average response time exceeds 2 seconds",
      "condition": {
        "query": "requests | where timestamp > ago(10m) | summarize avg_duration = avg(duration)",
        "operator": "GreaterThan",
        "threshold": 2000,
        "timeAggregation": "Average",
        "frequencyInMinutes": 5,
        "windowSizeInMinutes": 10
      },
      "severity": "Warning",
      "actions": [
        {
          "type": "email",
          "recipients": ["dev-team@company.com"]
        }
      ]
    },
    {
      "name": "AI Processing Failures",
      "description": "Alert when AI processing failure rate is high",
      "condition": {
        "query": "customEvents | where name == 'AI_ProcessingFailed' | where timestamp > ago(15m) | count",
        "operator": "GreaterThan",
        "threshold": 5,
        "timeAggregation": "Total",
        "frequencyInMinutes": 15,
        "windowSizeInMinutes": 15
      },
      "severity": "Warning",
      "actions": [
        {
          "type": "email",
          "recipients": ["ai-team@company.com"]
        }
      ]
    },
    {
      "name": "DevOps API Rate Limiting",
      "description": "Alert when hitting DevOps API rate limits",
      "condition": {
        "query": "dependencies | where name contains 'DevOps' | where resultCode == '429' | where timestamp > ago(5m) | count",
        "operator": "GreaterThan",
        "threshold": 0,
        "timeAggregation": "Total",
        "frequencyInMinutes": 5,
        "windowSizeInMinutes": 5
      },
      "severity": "Warning",
      "actions": [
        {
          "type": "email",
          "recipients": ["dev-team@company.com"]
        }
      ]
    }
  ],
  
  "dashboards": [
    {
      "name": "SDR System Overview",
      "widgets": [
        {
          "type": "metric",
          "title": "Active Users (Last Hour)",
          "query": "requests | where timestamp > ago(1h) | summarize users = dcount(user_Id)"
        },
        {
          "type": "chart",
          "title": "SDR Creation Rate",
          "query": "customEvents | where name == 'SDR_Created' | where timestamp > ago(24h) | summarize count() by bin(timestamp, 1h)"
        },
        {
          "type": "metric",
          "title": "AI Processing Success Rate",
          "query": "customEvents | where name startswith 'AI_' | where timestamp > ago(1h) | summarize success_rate = 100.0 * countif(name == 'AI_ContentProcessed') / count()"
        },
        {
          "type": "chart",
          "title": "Response Time Trends",
          "query": "requests | where timestamp > ago(4h) | summarize avg_duration = avg(duration) by bin(timestamp, 15m)"
        }
      ]
    }
  ]
}
```

---

## 7. Backup and Disaster Recovery Standards

### 7.1 Backup Strategy

```typescript
// Backup configuration and procedures
export interface BackupStrategy {
  devOpsData: {
    frequency: 'daily';
    retention: '30 days';
    method: 'export-to-blob';
    automation: 'azure-logic-app';
  };
  
  storageAccount: {
    frequency: 'continuous';
    retention: '7 days point-in-time, 30 days snapshots';
    method: 'geo-redundant-storage';
    crossRegionReplication: true;
  };
  
  keyVault: {
    frequency: 'continuous';
    retention: '90 days';
    method: 'azure-backup';
    softDelete: true;
  };
  
  applicationCode: {
    frequency: 'per-deployment';
    retention: 'indefinite';
    method: 'git-repository';
    additionalBackup: 'azure-artifacts';
  };
}

// Disaster Recovery procedures
export class DisasterRecoveryService {
  async initiateFailover(targetRegion: string): Promise<void> {
    console.log(`Initiating failover to ${targetRegion}`);
    
    // 1. Verify backup integrity
    await this.verifyBackups();
    
    // 2. Provision infrastructure in target region
    await this.provisionInfrastructure(targetRegion);
    
    // 3. Restore data
    await this.restoreData(targetRegion);
    
    // 4. Update DNS records
    await this.updateDNSRecords(targetRegion);
    
    // 5. Validate system health
    await this.validateSystemHealth();
    
    console.log(`Failover to ${targetRegion} completed`);
  }
  
  private async verifyBackups(): Promise<void> {
    // Implement backup verification logic
  }
  
  private async provisionInfrastructure(region: string): Promise<void> {
    // Deploy infrastructure using Bicep templates
  }
  
  private async restoreData(region: string): Promise<void> {
    // Restore from backups
  }
}
```

### 7.2 Recovery Time and Point Objectives

| Component | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Method |
|-----------|-------------------------------|--------------------------------|---------|
| Static Web App | 15 minutes | 0 (code in git) | Redeploy from source |
| Function Apps | 30 minutes | 0 (code in git) | Redeploy from source |
| DevOps Work Items | 4 hours | 24 hours | Restore from daily export |
| File Storage | 1 hour | 15 minutes | GRS failover |
| Key Vault | 2 hours | 0 (continuous backup) | Cross-region replication |
| Configuration | 15 minutes | 0 (IaC templates) | Redeploy infrastructure |

---

## 8. Security and Compliance Standards

### 8.1 Security Hardening Checklist

```yaml
# Security configuration checklist
security_hardening:
  network:
    - enable_https_only: true
    - disable_ftp: true
    - enable_waf: true
    - configure_nsg_rules: true
    - enable_private_endpoints: true # Production only
    
  authentication:
    - enforce_azure_ad: true
    - enable_mfa: true
    - configure_rbac: true
    - rotate_secrets: "every 90 days"
    
  data:
    - encrypt_at_rest: true
    - encrypt_in_transit: true
    - enable_backup_encryption: true
    - configure_retention_policies: true
    
  monitoring:
    - enable_audit_logs: true
    - configure_security_alerts: true
    - enable_defender: true
    - monitor_privileged_access: true
    
  compliance:
    - gdpr_compliance: true
    - data_classification: true
    - access_reviews: "quarterly"
    - vulnerability_scans: "monthly"
```

### 8.2 Access Control Matrix

| Role | Resource Group | Key Vault | Storage Account | Function App | DevOps Projects |
|------|---------------|-----------|-----------------|--------------|----------------|
| Developer | Contributor | Secret User | Blob Data Contributor | Contributor | Contributor |
| DevOps Engineer | Owner | Owner | Storage Account Contributor | Owner | Project Administrator |
| Security Team | Reader | Reader | Reader | Reader | Reader |
| End Users | None | None | None | None | Basic Access |

This comprehensive Infrastructure & DevOps Standards document provides the foundation for consistent, secure, and maintainable operations of the SDR Management System across all environments.