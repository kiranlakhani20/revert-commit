/*var DevOpsArtifactAPIResponseDecoratorTest = Class.create();

DevOpsArtifactAPIResponseDecoratorTest.prototype = {
	TESTNAME: 'DevOpsArtifactAPIResponseDecoratorTest',
	
	initialize: function() {
		this._testHelper = new global.DevOpsTestHelper();
		this._connectionUtil = new global.DevOpsConnectionUtil();
		this._toolUtil = new global.DevOpsToolUtil();
		this.recordsToClean = [];
	},

	setUp: function() {
	},

	tearDown: function() {
		this._testHelper.cleanRecords(this.recordsToClean.reverse());
	},

	
	

	type: 'DevOpsArtifactAPIResponseDecoratorTest'
}*/
var pay = {
    "artifact_version": {
      "update": [
        "Update file"
      ]
    }
  }
  console.log(pay.artifact_version.update.length);