@description('Environment name')
param environment string

@description('Location for resources')
param location string

@description('Function App name')
param functionAppName string

@description('Storage Account name')
param storageAccountName string

@description('Key Vault name')
param keyVaultName string

@description('Enable Key Vault deployment')
param enableKeyVault bool

@description('Resource tags')
param tags object = {}

// Hosting Plan for Function App
resource hostingPlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: 'EP1'
    tier: 'ElasticPremium'
  }
  tags: tags
}

// Function App
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  tags: tags
  properties: {
    siteConfig: {
      appSettings: enableKeyVault ? concat([
        {
          name: 'KEYVAULT_NAME'
          value: keyVaultName
        },
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=<storageKey>'  // Replace <storageKey> with actual key or use managed identity
        }
      ], array({})) : [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=<storageKey>'
        }
      ]
    }
    serverFarmId: hostingPlan.id
  }
}

// Add Key Vault access policy for Function App if enabled
resource keyVaultAccess 'Microsoft.KeyVault/vaults/accessPolicies@2023-02-01' = if (enableKeyVault) {
  parent: keyVault
  name: 'addFunctionAppAccess'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: functionApp.identity.principalId  // Assuming system assigned identity
        permissions: {
          secrets: [
            'get',
            'list'
          ]
          keys: [
            'get',
            'list'
          ]
          certificates: []
        }
      }
    ]
  }
}

// Reference to Key Vault (assuming deployed in core module)
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = if (enableKeyVault) {
  name: keyVaultName
}

// Outputs
output functionAppName string = functionAppName
output functionAppId string = functionApp.id
