var JenkinsProcessorTest = Class.create();

JenkinsProcessorTest.prototype = {

	TESTNAME : 'Test JenkinsProcessor',
	
	initialize: function() {
		this._testHelper = new global.DevOpsTestHelper();
		this._devOpsOrchestrationToolUtil = new global.DevOpsOrchestrationToolUtil();
		this._devOpsEventUtil = new global.DevOpsEventUtil();
		this.recordsToClean = [];
	},
	setUp: function() {
		this.jenkinsProcessorTestSuiteSetUp();
	},
	tearDown: function() {
		this.jenkinsProcessorTestSuiteTearDown();
	},
	testHandlePipelineEventWhenOrchestrationTaskDoesNotExist: function() {
		var jenkinsEventProcessor,
			expectedEvent,
			normalizedRecords;
		
		this._setUpPipelineEvent();
		normalizedRecords = {};
		jenkinsEventProcessor = new JenkinsProcessor();
		normalizedRecords = jenkinsEventProcessor.handlePipelineEvent(this.pipelineEventPayload, this.grPipelineEvent, normalizedRecords);
		expectedEvent = {
			processingDetails: 'Orchestration Task not found or not being tracked. Run Discover Orchestration Tasks and verify that track flag is enabled.',
			state: global.DevOpsTestConstants.EVENT_STATE_IGNORED
		};
		this._devOpsEventUtil.validateEvent(expectedEvent, this.pipelineEventSysId);
		
		this._testHelper.assert('assertEquals', '{}', JSON.stringify(normalizedRecords), 'Returns incorrect records');
	},
	testHandlePipelineEventWhenOrchestrationTaskExists: function() {
		var jenkinsEventProcessor,
			expectedNormalizedTaskExecution,
			normalizedRecords;
		
		this._setUpOrchestrationTask();
		this._setUpPipelineEvent();
		normalizedRecords = {};
		jenkinsEventProcessor = new JenkinsProcessor();
		normalizedRecords = jenkinsEventProcessor.handlePipelineEvent(this.pipelineEventPayload, this.grPipelineEvent, normalizedRecords);
		
		expectedNormalizedTaskExecution = {
	        'processedIDs': [this.pipelineEventSysId],
	        'normalizedObject': {
	            'orchestrationTask_id': this.orchestrationTaskSysId,
	            'start_time': this.pipelineEventPayload.stageModel.timestamp,
	            'name': this.pipelineEventPayload.jobModel.name + '/' + this.pipelineEventPayload.stageModel.name,
	            'tool_id': this.orchestrationToolSysId,
	            'native_id': this.pipelineEventPayload.jobModel.name + '/' + this.pipelineEventPayload.stageModel.name + ' #' + this.pipelineEventPayload.number,
	            'build_number': this.pipelineEventPayload.number,
	            'url': this.pipelineEventPayload.stageModel.url,
	            'isMultiBranch': this.pipelineEventPayload.isMultiBranch,
	            'branchName': this.pipelineEventPayload.scmModel.branch,
	            'task_url': this.orchestrationTaskUrl,
	            'logUrl': this.pipelineEventPayload.url + global.DevOpsTestConstants.JENKINS_CONSOLE_LOG,
	            'result': this.pipelineEventPayload.stageModel.result,
	            'end_time': this.pipelineEventPayload.stageModel.timestamp,
	            'log': this.pipelineEventPayload.stageModel.log
	        },
	    };
		this._devOpsOrchestrationToolUtil.validateNormalizedTaskExecution(expectedNormalizedTaskExecution, normalizedRecords);
	},
	testHandleFreestyleEventWithNoOrchestrationId: function() {
		var jenkinsEventProcessor,
			expectedEvent,
			normalizedRecords;
		this._setUpPipelineEvent();
		normalizedRecords = {};
		jenkinsEventProcessor = new JenkinsProcessor();
		normalizedRecords = jenkinsEventProcessor.handleFreestyleEvent(this.pipelineEventPayload, this.grPipelineEvent, normalizedRecords);
		
		expectedEvent = {
			processingDetails: 'Orchestration Task not found or not being tracked. Run Discover Orchestration Tasks and verify that track flag is enabled.',
			state: global.DevOpsTestConstants.EVENT_STATE_IGNORED
		};
		this._devOpsEventUtil.validateEvent(expectedEvent, this.pipelineEventSysId);
		this._testHelper.assert('assertEquals', '{}', JSON.stringify(normalizedRecords), 'Returns incorrect records');
	},
	testHandleFreestyleEventWithOrchestrationId: function() {
		var jenkinsEventProcessor,
			expectedNormalizedTaskExecution,
			normalizedRecords;
		
		this._setUpOrchestrationTask();
		this._setUpPipelineEvent();
		normalizedRecords = {};
		jenkinsEventProcessor = new JenkinsProcessor();
		normalizedRecords = jenkinsEventProcessor.handleFreestyleEvent(this.pipelineEventPayload, this.grPipelineEvent, normalizedRecords);
		
		expectedNormalizedTaskExecution = {
	        'processedIDs': [this.pipelineEventSysId],
	        'normalizedObject': {
	            'orchestrationTask_id': this.orchestrationTaskSysId,
	            'start_time': this.pipelineEventPayload.stageModel.timestamp,
	            'name': this.pipelineEventPayload.jobModel.name + '/' + this.pipelineEventPayload.stageModel.name,
	            'tool_id': this.orchestrationToolSysId,
	            'native_id': this.pipelineEventPayload.jobModel.name + '/' + this.pipelineEventPayload.stageModel.name + ' #' + this.pipelineEventPayload.number,
	            'build_number': this.pipelineEventPayload.number,
	            'url': this.pipelineEventPayload.stageModel.url,
	            'isMultiBranch': this.pipelineEventPayload.isMultiBranch,
	            'branchName': this.pipelineEventPayload.scmModel.branch,
	            'task_url': this.orchestrationTaskUrl,
	            'logUrl': this.pipelineEventPayload.url + global.DevOpsTestConstants.JENKINS_CONSOLE_LOG,
	            'result': this.pipelineEventPayload.stageModel.result,
	            'end_time': this.pipelineEventPayload.stageModel.timestamp,
	            'log': this.pipelineEventPayload.stageModel.log
	        },
	    };
		this._testHelper.assert('assertEquals', "48", expectedNormalizedTaskExecution.normalizedObject.build_number, 'Error in creating normalized objects for pipeline');
		this._testHelper.assert('assertEquals', "http://localhost:8081/job/Test_Pipeline_1/48/console", expectedNormalizedTaskExecution.normalizedObject.logUrl, 'Error in creating normalized objects for pipeline');
	},
	test_createNormalizedObjectForPipeline: function(){
		this._setUpPipelineEvent();
		var jenkinsEventProcessor = new JenkinsProcessor();
		var normalizedObject = jenkinsEventProcessor._createNormalizedObjectForPipeline(this.pipelineEventPayload);
		
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.tool_id), JSON.stringify(this.pipelineEventPayload.sn_tool_id), 'Error in creating normalized objects for pipeline');
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.build_number), JSON.stringify(this.pipelineEventPayload.number), 'Error in creating normalized objects for pipeline');
	},
	test_createNormalizedObjectWithPayload: function(){
		this._setUpPipelineEvent();
		var jenkinsEventProcessor = new JenkinsProcessor();
		var normalizedObject = jenkinsEventProcessor._createNormalizedObject(this.pipelineEventPayload);
		
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.build_number), JSON.stringify(this.pipelineEventPayload.number), 'Error in creating normalized objects for pipeline');
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.build_number), JSON.stringify(this.pipelineEventPayload.number), 'Error in creating normalized objects for pipeline');
	},
	test_createNormalizedObjectWithoutPayload: function(){
		var jenkinsEventProcessor = new JenkinsProcessor();
		var normalizedObject = jenkinsEventProcessor._createNormalizedObject({});
		
		this._testHelper.assert('assertEquals','{}', JSON.stringify(normalizedObject), 'creating pipeline without payload');
	},
	test_getCorrectUpstreamTaskExecutionWithoutSettingOrchTaskExecution: function(){
		var UpstreamTaskExecutionId;
		var jenkinsEventProcessor = new JenkinsProcessor();
		var upstreamTaskExecutionSysId = jenkinsEventProcessor._getCorrectUpstreamTaskExecution('','');
	
		this._testHelper.assert('assertEquals',UpstreamTaskExecutionId, upstreamTaskExecutionSysId, 'Returning Upstream Task Execution sys Id without creating an Orchestration task');
	},
	test_createNormalizedObjectForFreestyle: function(){
		this._setUpPipelineEvent();
		var jenkinsEventProcessor = new JenkinsProcessor();
		var normalizedObject = jenkinsEventProcessor._createNormalizedObjectForFreestyle(this.pipelineEventPayload);
		
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.tool_id), JSON.stringify(this.pipelineEventPayload.sn_tool_id), 'Error in creating normalized objects for pipeline');
		this._testHelper.assert('assertEquals', JSON.stringify(normalizedObject.build_number), JSON.stringify(this.pipelineEventPayload.number), 'Error in creating normalized objects for pipeline');
	},
	test_getStageCompletedEventGRWithoutExecutionURL: function(){
	 	 
		var jenkinsEventProcessor = new JenkinsProcessor()._getStageCompletedEventGR('','');
		this._testHelper.assert('assertEquals', false, jenkinsEventProcessor.isValidRecord(), 'Returning Valid Record');
	},
	test_updateStatesOfEvents: function(){
		var jenkinsEventProcessor,
			ids,
			details,
			eventsRecord,
			state;
		ids = this._testHelper.insertGlideRecord(global.DevOpsTestConstants.EVENTS_TBL);
		state = 'processing';
		details = 'message';
		jenkinsEventProcessor = new JenkinsProcessor()._updateStatesOfEvents(ids,state,details);
		eventsRecord = this._testHelper.getRecord(ids,global.DevOpsTestConstants.EVENTS_TBL);
		this._testHelper.assert('assertEquals',state , eventsRecord.state, 'Does not update the record state');
		this.recordsToClean.push(eventsRecord);
	},
	jenkinsProcessorTestSuiteSetUp: function() {
		this._setUpOrchestrationTool();
	},
	jenkinsProcessorTestSuiteTearDown: function() {
		this._testHelper.cleanRecords(this.recordsToClean.reverse());
	},
	_setUpOrchestrationTool: function() {
		// 1. create credentials
		var credentialsSysId = this._devOpsOrchestrationToolUtil.createCredential('Jenkins_Credential', global.DevOpsTestConstants.JENKINS_USER_ID, global.DevOpsTestConstants.JENKINS_USER_PASSWORD);
		var grCredentials = this._testHelper.getRecord(credentialsSysId, global.DevOpsTestConstants.CREDENTIALS_TBL);
		this.recordsToClean.push(grCredentials);
		
		// 2. Create connection and associate to a credentials alias
		var connectionSysId = this._devOpsOrchestrationToolUtil.createJenkinsConnection('Jenkins_Connection', this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL, credentialsSysId);
		var grConnection = this._testHelper.getRecord(connectionSysId, global.DevOpsTestConstants.CONNECTIONS_TBL);
		this.recordsToClean.push(grConnection);
		
		// 3. Create orchestration tool for above alias
		this.orchestrationToolSysId = this._devOpsOrchestrationToolUtil.createJenkinsOrchestrationTool('jenkins', global.DevOpsTestConstants.CONNECTION_STATE_CONNECTED);
		this.grOrchestrationTool = this._testHelper.getRecord(this.orchestrationToolSysId, global.DevOpsTestConstants.ORCHESTRATION_TOOLS_TBL);
		this.recordsToClean.push(this.grOrchestrationTool);
	},
	_setUpOrchestrationTask: function() {
		this.orchestrationTaskUrl = this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL + '/job/Test_Pipeline_1#deploy/';
		this.orchestrationTaskSysId = this._devOpsOrchestrationToolUtil.createOrchestrationTask('Test_Pipeline_1#deploy', 'Test_Pipeline_1#deploy', this.orchestrationTaskUrl,this.orchestrationToolSysId, true);
		this.grOrchestrationTask = this._testHelper.getRecord(this.orchestrationTaskSysId, global.DevOpsTestConstants.ORCHESTRATION_TASKS_TBL);
		this.recordsToClean.push(this.grOrchestrationTask);
	},
	_setUpPipelineEvent: function() {
		this.pipelineEventPayload = {
		    'scmModel':
		    {
		        'url': '',
		        'branch': '',
		        'commit': '',
		        'changes': [],
		        'culprits': []
		    },
		    'stageModel':
		    {
		        'name': 'deploy',
		        'id': '25',
		        'phase': 'COMPLETED',
		        'duration': 100118,
		        'url': this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL + '/job/Test_Pipeline_1/48/execution/node/25/wfapi/describe',
		        'result': 'SUCCESS',
		        'upstreamTaskExecutionURL': this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL + '/job/Test_Pipeline_1/48/execution/node/19/wfapi/describe',
		        'upstreamStageName': 'test',
		        'log': ['[Stage:deploy] \n\n', '[ServiceNow DevOps] Step associated successfully\n', '[ServiceNow DevOps] Job is under change control\n[ServiceNow DevOps] Job has been approved for execution\n', 'deploy\n'],
		        'timestamp': 1570627751509
		    },
		    'testModel':
		    {
		        'total': 0,
		        'failed': 0,
		        'passed': 0,
		        'skipped': 0,
		        'regression': 0,
		        'fixed': 0
		    },
		    'jobModel':
		    {
		        'name': 'Test_Pipeline_1',
		        'url': this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL + '/job/Test_Pipeline_1/'
		    },
		    'log': [],
		    'url': this._devOpsOrchestrationToolUtil.JENKINS_HTML_URL + '/job/Test_Pipeline_1/48/',
		    'number': 48,
		    'phase': '',
		    'result': '',
		    'startDateTime': '',
		    'endDateTime': '',
		    'triggerType': '',
		    'upstreamTaskExecutionURL': '',
		    'pronoun': 'Pipeline',
		    'isMultiBranch': 'false',
		    'timestamp': 1570627646701,
		    'sn_tool_id': this.orchestrationToolSysId
		};
		this.pipelineEventSysId = this._devOpsEventUtil.createEvent(this.pipelineEventPayload, this.orchestrationToolSysId);
		this.grPipelineEvent = this._devOpsEventUtil.getEvent(this.pipelineEventSysId);
		this.recordsToClean.push(this.grPipelineEvent);
	},
	_setUpEventsTable: function(){
		this.eventSysId = this._testHelper.insertGlideRecord(global.DevOpsTestConstants.EVENTS_TBL);
		this.grEvent = this._testHelper.getRecord(this.eventSysId,global.DevOpsTestConstants.EVENTS_TBL);
		this.grEvent.addQuery('sys_id',this.eventSysId);
		this.grEvent.query();
		while(this.grEvent.next()){
		 	this.grEvent.setValue('sys_created_on','2018-11-02 00:36:46');
		 	this.grEvent.setValue('tool','jenkins');
		 	this.grEvent.setValue('state','ready');
		 	this.grEvent.update(); 	
		};
		this.grEvent = this._testHelper.getRecord(this.eventSysId,global.DevOpsTestConstants.EVENTS_TBL);
		this.recordsToClean.push(this.grEvent);
	},
    type: 'JenkinsProcessorTest'
}
