targetScope = 'subscription'

@description('Environment name (dev, test, prod)')
param environment string

@description('Location for resources')
param location string = 'uksouth'

@description('Application name prefix')
param appName string = 'sdr'

@description('Enable Key Vault deployment for production')
param enableKeyVault bool = (environment == 'prod')

@description('Resource tags')
param tags object = {}

// Variables
var resourceGroupName = '${appName}-${environment}-rg'
var keyVaultName = '${appName}-${environment}-kv'
var storageAccountName = '${appName}${environment}sa'
var functionAppName = '${appName}-${environment}-func'
var staticWebAppName = '${appName}-${environment}-swa'
var botServiceName = '${appName}-${environment}-bot'

// Resource Group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// Deploy core infrastructure
module coreInfrastructure 'modules/core-infrastructure.bicep' = {
  name: 'core-infrastructure'
  scope: resourceGroup
  params: {
    environment: environment
    location: location
    keyVaultName: keyVaultName
    storageAccountName: storageAccountName
    enableKeyVault: enableKeyVault
    tags: tags
  }
}

// Deploy API (Azure Functions)
module apiInfrastructure 'modules/api-infrastructure.bicep' = {
  name: 'api-infrastructure'
  scope: resourceGroup
  params: {
    environment: environment
    location: location
    functionAppName: functionAppName
    storageAccountName: storageAccountName
    keyVaultName: keyVaultName
    enableKeyVault: enableKeyVault
    tags: tags
  }
  dependsOn: [
    coreInfrastructure
  ]
}

// Deploy Frontend (Static Web Apps)
module frontendInfrastructure 'modules/frontend-infrastructure.bicep' = {
  name: 'frontend-infrastructure'
  scope: resourceGroup
  params: {
    environment: environment
    location: location
    staticWebAppName: staticWebAppName
    tags: tags
  }
}

// Deploy Bot Service
module botInfrastructure 'modules/bot-infrastructure.bicep' = {
  name: 'bot-infrastructure'
  scope: resourceGroup
  params: {
    environment: environment
    location: location
    botServiceName: botServiceName
    functionAppName: functionAppName
    keyVaultName: keyVaultName
    enableKeyVault: enableKeyVault
    tags: tags
  }
  dependsOn: [
    apiInfrastructure
    coreInfrastructure
  ]
}

// Outputs
output resourceGroupName string = resourceGroupName
output keyVaultName string = keyVaultName
output functionAppName string = functionAppName
output staticWebAppName string = staticWebAppName
output botServiceName string = botServiceName
