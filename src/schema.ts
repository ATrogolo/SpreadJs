export const schema = {
  entitySets: [
    {
      name: '_Layouts',
      entityType: '\\DataStructure._Layouts',
    },
    {
      name: 'WebHostStyle',
      entityType: '\\DataStructure.WebHostStyle',
    },
    {
      name: 'Bookbar',
      entityType: '\\DataStructure.Bookbar',
    },
    {
      name: 'HookOptionList',
      entityType: '\\DataStructure.HookOptionList',
    },
    {
      name: 'SharedVariablesIterator',
      entityType: '\\DataStructure.SharedVariablesIterator',
    },
    {
      name: 'DataStructure',
      entityType: '\\DataStructure.DataStructure',
    },
  ],
  entityTypes: [
    {
      fullName: '\\DataStructure._Layouts',
      name: '_Layouts',
      odataName: '_Layouts',
      properties: [
        {
          name: 'Viewer',
          type: 'String',
          maxLength: '512',
        },
        {
          name: 'Value',
          type: 'String',
          maxLength: '0',
        },
      ],
      navigationProperties: [],
    },
    {
      fullName: '\\DataStructure.WebHostStyle',
      name: 'WebHostStyle',
      odataName: 'WebHostStyle',
      properties: [
        {
          name: '__InternalIdentifier',
          type: 'Int32',
          maxLength: '',
          autoincrement: true,
          key: true,
        },
        {
          name: 'Style',
          type: 'String',
          maxLength: '0',
        },
      ],
      navigationProperties: [],
    },
    {
      fullName: '\\DataStructure.Bookbar',
      name: 'Bookbar',
      odataName: 'Bookbar',
      properties: [
        {
          name: 'SolutionId',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'ContextId',
          type: 'String',
          maxLength: '50',
        },
        {
          name: 'ContextType',
          type: 'String',
          maxLength: '20',
        },
        {
          name: 'ReaderId',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'ReaderVersionId',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'ReaderType',
          type: 'String',
          maxLength: '20',
        },
        {
          name: 'Status',
          type: 'String',
          maxLength: '8000',
        },
        {
          name: 'ChangeManagementMenu',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'SettingsMenu',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'TabActive',
          type: 'String',
          maxLength: '50',
        },
        {
          name: 'Layout',
          type: 'String',
          maxLength: '0',
        },
        {
          name: 'Username',
          type: 'String',
          maxLength: '388',
        },
        {
          name: 'CanPush',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'ModelAccess',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'DataAccess',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'IsPublisher',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'ExecutionContext',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: '__InternalIdentifier',
          type: 'Int32',
          maxLength: '',
          autoincrement: true,
          key: true,
        },
        {
          name: 'OriginChangeLineName',
          type: 'String',
          maxLength: '512',
        },
        {
          name: 'OrigChangeLineId',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'OrigChangeLineVersionId',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'ToolsMenu',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'Manage_ChangeSet',
          type: 'Boolean',
          maxLength: '',
          realName: 'Manage ChangeSet',
        },
        {
          name: 'ManageChangeLine',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'ManagePerimeter',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'IsModelChanged',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'IsGlanceLicensePresent',
          type: 'Boolean',
          maxLength: '',
        },
      ],
      navigationProperties: [],
    },
    {
      fullName: '\\DataStructure.HookOptionList',
      name: 'HookOptionList',
      odataName: 'HookOptionList',
      properties: [
        {
          name: '__InternalIdentifier',
          type: 'Int32',
          maxLength: '',
          autoincrement: true,
          key: true,
        },
        {
          name: 'HookId',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'HookOptionId',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'HookType',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'HookName',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'HookOptionName',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'HookOptionDescription',
          type: 'String',
          maxLength: '8000',
        },
        {
          name: 'ExtensionId',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'NeedUI',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'ExtensionParam',
          type: 'String',
          maxLength: '0',
        },
        {
          name: 'Caption',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'Icon',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'OrderPosition',
          type: 'Int32',
          maxLength: '',
        },
        {
          name: 'IsDefault',
          type: 'Boolean',
          maxLength: '',
        },
      ],
      navigationProperties: [],
    },
    {
      fullName: '\\DataStructure.SharedVariablesIterator',
      name: 'SharedVariablesIterator',
      odataName: 'SharedVariablesIterator',
      properties: [
        {
          name: '__InternalIdentifier',
          type: 'Int32',
          maxLength: '',
          autoincrement: true,
          key: true,
        },
        {
          name: 'Name',
          type: 'String',
          maxLength: '50',
        },
        {
          name: 'DataType',
          type: 'String',
          maxLength: '50',
        },
        {
          name: 'DefaultValue',
          type: 'String',
          maxLength: '500',
        },
      ],
      navigationProperties: [],
    },
    {
      fullName: '\\DataStructure.DataStructure',
      name: 'DataStructure',
      odataName: 'DataStructure',
      properties: [
        {
          name: 'Product',
          type: 'String',
          maxLength: '128',
        },
        {
          name: 'LastUpdateTenantGuid',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'LastUpdate',
          type: 'DateTimeOffset',
          baseType: 'DateTime2',
          maxLength: '',
        },
        {
          name: 'LastUpdateUsername',
          type: 'String',
          maxLength: '256',
        },
        {
          name: 'RecordState',
          type: 'String',
          maxLength: '10',
        },
        {
          name: 'DataStructureId',
          type: 'Guid',
          maxLength: '',
        },
        {
          name: 'DataStructureCode',
          type: 'String',
          maxLength: '500',
        },
        {
          name: 'DataStructureName',
          type: 'String',
          maxLength: '128',
        },
        {
          name: 'DataStructureDescription',
          type: 'String',
          maxLength: '8000',
        },
        {
          name: 'Permission',
          type: 'String',
          maxLength: '1',
        },
        {
          name: '__InternalIdentifier',
          type: 'Int32',
          maxLength: '',
          autoincrement: true,
          key: true,
        },
        {
          name: 'PermissionWithoutContext',
          type: 'String',
          maxLength: '1',
        },
        {
          name: 'IsTrusted',
          type: 'Boolean',
          maxLength: '',
        },
        {
          name: 'CanEdit',
          type: 'Boolean',
          maxLength: '',
        },
      ],
      navigationProperties: [],
    },
  ],
  actions: [
    {
      name: 'InvokeDSTDetailBook',
      parameters: [
        {
          name: 'ExecutionHandle',
          type: 'String',
          maxLength: '36',
        },
        {
          name: 'DataStructureId',
          type: 'String',
          maxLength: '36',
        },
        {
          name: 'Action',
          type: 'String',
          maxLength: '50',
        },
      ],
      returnType: 'String',
    },
    {
      name: 'DeleteDST',
      parameters: [
        {
          name: 'selectedDST',
          type: 'String',
          maxLength: '8000',
        },
        {
          name: 'OperationResult',
          type: 'Int32',
        },
        {
          name: 'OperationMessage',
          type: 'String',
          maxLength: '8000',
        },
      ],
      returns: [
        {
          name: 'OperationResult',
          type: 'Edm.Int32',
        },
        {
          name: 'OperationMessage',
          type: 'Edm.String',
        },
      ],
    },
    {
      name: 'MasterExecutionHandle',
      parameters: [
        {
          name: 'MasterExecutionHandle',
          type: 'String',
          maxLength: '36',
        },
      ],
      returnType: 'String',
    },
    {
      name: 'DumpContext',
      parameters: [
        {
          name: 'activeRow',
          type: 'Guid',
        },
        {
          name: 'selectedRows',
          type: 'String',
          maxLength: '0',
        },
      ],
    },
    {
      name: 'RunExtension',
      parameters: [
        {
          name: 'HookOptionId',
          type: 'Guid',
        },
        {
          name: 'RunExtensionExecutionHandle',
          type: 'Guid',
        },
        {
          name: 'NeedUI',
          type: 'Boolean',
        },
        {
          name: 'Result',
          type: 'Int32',
        },
        {
          name: 'ErrorMessage',
          type: 'String',
          maxLength: '4000',
        },
      ],
      returns: [
        {
          name: 'RunExtensionExecutionHandle',
          type: 'Edm.Guid',
        },
        {
          name: 'NeedUI',
          type: 'Edm.Boolean',
        },
        {
          name: 'Result',
          type: 'Edm.Int32',
        },
        {
          name: 'ErrorMessage',
          type: 'Edm.String',
        },
      ],
    },
    {
      name: '_RunExtension',
      parameters: [
        {
          name: 'params',
          type: 'String',
          maxLength: '0',
        },
        {
          name: 'ExtensionId',
          type: 'Guid',
        },
        {
          name: 'callerExecutionHandle',
          type: 'Guid',
        },
        {
          name: 'showRunExtensionModalVariable',
          type: 'String',
          maxLength: '50',
        },
        {
          name: 'callbackCommand',
          type: 'String',
          maxLength: '50',
        },
        {
          name: '_ExecutionHandle',
          type: 'Guid',
        },
      ],
      returnType: 'Guid',
    },
  ],
}
