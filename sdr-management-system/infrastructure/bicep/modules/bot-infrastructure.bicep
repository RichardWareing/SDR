@description('Environment name')
param environment string

@description('Location for resources')
param location string

@description('Bot Service name')
param botServiceName string

@description('Function App name')
param functionAppName string

@description('Key Vault name')
param keyVaultName string

@description('Enable Key Vault deployment')
param enableKeyVault bool

@description('Resource tags')
param tags object = {}

// Bot Service
resource botService 'Microsoft.BotService/botServices@2021-05-01-preview' = {
  name: botServiceName
  location: location
  tags: tags
  sku: {
    name: 'S1'
  }
  kind: 'azurebot'
  properties: {
    displayName: '${botServiceName}-display'
    endpoint: 'https://${functionAppName}.azurewebsites.net/api/messages'
    msaAppId: 'placeholder-msa-app-id'
    msaAppType: 'UserAssignedMSI'
    developerAppInsightKey: 'placeholder-insights-key'
    developerAppInsightsApplicationId: ''
    disableLocalAuth: enableKeyVault  // Enable local auth if Key Vault is used
  }
}

// Add Key Vault reference if enabled
resource functionApp 'Microsoft.Web/sites@2022-09-01' existing = {
  name: functionAppName
}

// Update Function App settings for Bot with Key Vault reference if enabled
resource functionAppConfig 'Microsoft.Web/sites/config@2022-09-01' = if (enableKeyVault) {
  parent: functionApp
  name: 'appsettings'
  properties: {
    KEYVAULT_NAME: keyVaultName
    // Placeholder for other settings related to Bot and Key Vault
  }
}

// Outputs
output botServiceName string = botServiceName
output botServiceId string = botService.id
