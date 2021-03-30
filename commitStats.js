var GitHubIntegrationHandler = Class.create();
GitHubIntegrationHandler.prototype = {

    TAG_URL_SUFFIX: '/-/tags/',
    REVERT_COMMIT_REGEX: /\bThis\s+reverts\s+commit\s+(\b[0-9a-f]+\b)/i,
    MERGE_REVERTED_TO_REGEX: /\breversing\s+changes\s+made\s+to\s+(\b[0-9a-f]+)/i,
    ALL_ZERO: /^0*$/i,
    COMMITS_COMPARE_DATASTREAM: 'sn_devops.github_commits_compare_data_stream',
    BRANCH_COMMITS_DATASTREAM: 'sn_devops.github_branch_commits_data_stream',

    initialize: function() {},

    handleCodeEvent: function(eventGr) {
        sn_devops.DevOpsLogger.log("GithubCommitProcessor1.handleCodeEvent() -> " + eventGr.getValue("sys_id") + " | " + eventGr.getDisplayValue());
        try {
            var payload = JSON.parse(eventGr.getValue("original_payload"));
            if (!gs.nil(payload)) {
				
				//tag deletion should be ignored
				if (this._isTagDeletionEvent(payload)) {
                    this.updateInboundEvent(eventGr, {
                        processing_details: gs.getMessage('Tag deletion event is not supported'),
                        state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_IGNORED
                    });
                    return;
                }

                var normalizedObject = {};
                normalizedObject.id = eventGr.getValue("tool"); //toolId
                normalizedObject.url = payload.repository.owner.url;
                normalizedObject.committedDate = payload.commits[0].timestamp;

                normalizedObject.repository = {
                    name: payload.repository.name,
                    url: payload.repository.owner.url
                };
                //from here
                if (this._isTagPushEvent(payload)) {
                    normalizedObject.entityType = 'tag';
                }
                //to here 
                else {
                    normalizedObject.branch = {
                        name: payload.ref
                    };
                } //added else
                normalizedObject.commits = [];
                sn_devops.DevOpsLogger.log("DevOpsGitLabIntegrationHandler.handleCodeEvent() -> normalizedObject: " + JSON.stringify(normalizedObject));

                return JSON.stringify(normalizedObject);
            } else
                this.updateInboundEvent(eventGr, {
                    processing_details: gs.getMessage('Payload is missing or invalid'),
                    state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
                });

        } catch (error) {
            sn_devops.DevOpsLogger.log("DevOpsGitLabIntegrationHandler.handleCodeEvent() error -> " + error);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('An error has occurred'),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
            });
        }
    },
    processSingleCommit1: function(eventGr, commit, commitStats) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler.processSingleCommit1() -> " + eventGr.getDisplayValue() + " | commit -> " + JSON.stringify(commit) + " | commitStats -> " + commitStats);
        try {
            var payload = JSON.parse(eventGr.getValue("original_payload"));
            if (!gs.nil(commit)) {
                var devopsCommitMessageParser = new sn_devops.DevopsCommitMessageParser();
                var commitObject = {
                    id: commit.id,
                    message: commit.message,
                    //nativeIdList: devopsCommitMessageParser.getWorkitemsFromCommitMessage(commit.message),
                    url: commit.url,
                    committedDate: commit.timestamp,
                    committer: {
                        email: commit.author.email,
                        name: commit.author.name
                    },
                    details: this._processCommitDetails(commitStats)
                };

                if (commitObject.details)
                    commitObject.totalFiles = commitObject.details.length;

                // getCommitStats
                commitObject = this._getCommitStats(commitStats, commitObject);

                /*  var connectionInfo = this.getConnectionInfo(eventGr.getValue("tool"));
                  if (!gs.nil(connectionInfo))
                      commitObject.apiURL = connectionInfo.connectionUrl + "/api/" + connectionInfo.apiVersion + "/projects/" + payload.project.id + "/repository/commits/" + commit.id;*/

                if (this._isTagPushEvent(payload))
                    commitObject = this._handleTagEvent(payload, commitObject);

                sn_devops.DevOpsLogger.log("GitHubIntegrationHandler.processSingleCommit1() -> commitObject: " + JSON.stringify(commitObject));

                var transformedPayload = JSON.parse(eventGr.getValue("transformed_payload"));
                if (!gs.nil(transformedPayload)) {
                    transformedPayload.commits.push(commitObject);
                    this.updateInboundEvent(eventGr, {
                        transformed_payload: JSON.stringify(transformedPayload)
                    });
                }
            } else
                this.updateInboundEvent(eventGr, {
                    processing_details: gs.getMessage('Commit is missing or invalid'),
                    state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
                });

        } catch (error) {
            sn_devops.DevOpsLogger.log("DevOpsGitLabIntegrationHandler.processSingleCommit() error -> " + error);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('An error has occurred'),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
            });
        }

    },
    _processCommitDetails: function(commitStats) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._processCommitDetails() -> commitStats: " + commitStats);
        var details = [];
        var commitObj;

        if (!gs.nil(commitStats)) {
            var commitStatsJSON = JSON.parse(commitStats);
            for (var i = 0; i < commitStatsJSON.files.length; i++) {
                commitObj = {
                    additions: commitStatsJSON.files[i].additions,
                    deletions: commitStatsJSON.files[i].deletions,
                    totalChanges: commitStatsJSON.files[i].changes,
                    file: commitStatsJSON.files[i].filename,
                    action: commitStatsJSON.files[i].status,
                }

            }
            details.push(commitObj);
        }

        DevOpsLogger.log("GitHubIntegrationHandler._processCommitDetails1() -> details" + JSON.stringify(details));
        return details;
    },
    _getCommitStats: function(commitStats, commitObject) {
        // get commit details
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._getCommitStats() -> commitStats : " + commitStats);
        var commitStatsJson;
        if (!gs.nil(commitStats)) {
            commitStatsJson = JSON.parse(commitStats);
            if (commitStatsJson && commitStatsJson.stats) {
                commitObject.totalAdditions = commitStatsJson.stats.additions || 0;
                commitObject.totalDeletions = commitStatsJson.stats.deletions || 0;
                commitObject.totalChanges = commitStatsJson.stats.total || 0;
            }
        }
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._getCommitStats() -> commitObject : " + JSON.stringify(commitObject));
        return commitObject;
    },

    updateInboundEvent: function(eventGr, attrs) {
        if (gs.nil(attrs) || gs.nil(eventGr))
            return;
        (new sn_devops.DevOpsInboundEventDAO()).updateBasic(attrs, eventGr);
    },

    executeCommitsDataStream: function(eventGr) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler.executeCommitsDataStream --> begin");
        var streamActionName = this._determineDatastreamAction(eventGr);

        if (streamActionName == this.BRANCH_COMMITS_DATASTREAM) {
            this._executeBranchCommitsDataStream(eventGr);
        } else if (streamActionName == this.COMMITS_COMPARE_DATASTREAM) {
            this._executeCompareCommitsDataStream(eventGr);
        }
    },

    _determineDatastreamAction: function(eventGr) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._determineDatastreamAction() --> begin : " + eventGr.getDisplayValue());
        var action = this.COMMITS_COMPARE_DATASTREAM;
        var payload = JSON.parse(eventGr.getValue("original_payload"));

        if (!gs.nil(payload) && this._isContainingOnlyZeros(payload.before)) {
            // Pushed branch was created locally without remote tracking branch.
            action = this.BRANCH_COMMITS_DATASTREAM;
        }

        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._determineDatastreamAction() --> action : " + action);
        return action;
    },

    _isContainingOnlyZeros: function(sha) {
        return !gs.nil(sha) && this.ALL_ZERO.test(sha);
    },

    _executeBranchCommitsDataStream: function(eventGr) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeBranchCommitsDataStream --> eventGr : " + eventGr.getDisplayValue());
        var commits = [];
        var item;
        var inputs = {};
        var ibCount = 0;
        var currentIndex = 0;
        var ignoreCommits = true;
        var stream;
        var originalPayload;
        var totalCommitsCount;
        var afterCommit;
        try {
            if (gs.nil(eventGr) || !eventGr.isValidRecord())
                return;

            originalPayload = JSON.parse(eventGr.getValue("original_payload"));

            totalCommitsCount = originalPayload.commits.length;
            afterCommit = originalPayload.after;

            if (totalCommitsCount < 1 || gs.nil(afterCommit) || this._isContainingOnlyZeros(afterCommit)) {
                sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeBranchCommitsDataStream --> totalCommitsCount : " + totalCommitsCount + " afterCommit : " + afterCommit);
                return;
            }
            inputs['eventgr'] = eventGr;
            stream = this._executeDataStreamAction(this.BRANCH_COMMITS_DATASTREAM, inputs);
            // Process each item in the data stream
            while (stream.hasNext()) {
                // Get a single item from the data stream.
                // Commits occure in reverse chronological order
                item = stream.next();
                // skip until afterCommit 
                if (item.id == afterCommit)
                    ignoreCommits = false;

                if (!ignoreCommits) {
                    currentIndex++;
                    if (currentIndex > totalCommitsCount)
                        break;

                    commits.push(item);
                    if (commits.length == 19) {
                        this._callCreateCommitsInboundEventsAsync(eventGr, commits);
                        ibCount++;
                        commits = [];
                    }
                }
            }
            if (commits.length > 0) {
                this._callCreateCommitsInboundEventsAsync(eventGr, commits);
                ibCount++;
            }

            sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeBranchCommitsDataStream() --> ibCount : " + ibCount);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('Created {0} inbound events', ibCount.toString()),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_IGNORED
            });

        } catch (error) {
            sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeBranchCommitsDataStream() error -> " + error);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('An error has occurred while processing commits datastream'),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
            });
        } finally {
            if (stream)
                stream.close();
        }
    },

    _executeDataStreamAction: function(name, inputs) {
        return sn_fd.FlowAPI.executeDataStreamAction(name, inputs);
    },

    _callCreateCommitsInboundEventsAsync: function(eventGr, commits) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._callCreateCommitsInboundEventsAsync --> eventGr : " + eventGr.getDisplayValue());
        try {
            var inputs = {};
            inputs['eventgr'] = eventGr;
            inputs['commits'] = JSON.stringify(commits);

            sn_fd.FlowAPI.startActionQuick('sn_devops.github_create_inbound_event_for_commits', inputs);
        } catch (ex) {
            var message = ex.getMessage();
            gs.error(message);
        }
    },

    _executeCompareCommitsDataStream: function(eventGr) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeCompareCommitsDataStream --> eventGr : " + eventGr.getDisplayValue());
        var commits = [];
        var item;
        var inputs = {};
        var stream;
        var ibCount = 0;
        try {
            inputs['eventgr'] = eventGr;
            stream = this._executeDataStreamAction(this.COMMITS_COMPARE_DATASTREAM, inputs);
            // Process each item in the data stream
            DevOpsLogger.log("Stream$$ " + stream);
            while (stream.hasNext()) {
                // Get a single item from the data stream.
                item = stream.next();
                DevOpsLogger.log("Item from stream-->" + item);
                commits.push(item);
                DevOpsLogger.log("commits##-->" + JSON.stringify(commits));
                if (commits.length == 19) {
                    this._callCreateCommitsInboundEventsAsync(eventGr, commits);
                    ibCount++;
                    commits = [];
                }
            }
            if (commits.length > 0) {
                this._callCreateCommitsInboundEventsAsync(eventGr, commits);
                ibCount++;
            }

            sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeCompareCommitsDataStream() --> ibCount : " + ibCount);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('Created {0} inbound events', ibCount.toString()),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_IGNORED
            });

        } catch (error) {
            sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._executeCompareCommitsDataStream() error -> " + error);
            this.updateInboundEvent(eventGr, {
                processing_details: gs.getMessage('An error has occurred while processing commits datastream'),
                state: sn_devops.DevOpsCommonConstants.INBOUND_EVENT_STATE_ERROR
            });
        } finally {
            if (stream)
                stream.close();
        }
    },

    createInboundEventForCommits: function(eventGr, commitsStr) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler.createInboundEventForCommits --> event | " + eventGr.getDisplayValue() + " | commitsStr : " + commitsStr);
        if (gs.nil(commitsStr))
            return;

        var commits = JSON.parse(commitsStr);
        if (gs.nil(commits) || commits.length <= 0)
            return;

        var originalPayload = JSON.parse(eventGr.getValue('original_payload'));
        var newPayload = JSON.parse(JSON.stringify(originalPayload));
        newPayload.commits = commits;
        newPayload.total_commits_count = commits.length;

        var inboundEventHandler = new sn_devops.InboundEventHandler();
        return inboundEventHandler.handleInboundEvent(sn_devops.DevOpsCommonConstants.TOOL_TYPE_CAPABILITY_CODE, JSON.parse(eventGr.getValue('headers')), newPayload, JSON.parse(eventGr.getValue('path_params')), JSON.parse(eventGr.getValue('query_params')));
    },



    // Handling Tags in GitHub
    _handleTagEvent: function(payload, commitObject) {
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._handleTagEvent() --> begin  payload: " + JSON.stringify(payload) + " commitObject: " + JSON.stringify(commitObject));
        if (gs.nil(payload) || gs.nil(payload.ref))
            return commitObject;
        var tagFullName = payload.ref;
        var tagName = tagFullName.replace('refs/tags/', '');
        var tag = {
            name: tagFullName,
            displayName: tagName,
            url: payload.repository.tags_url,
            sha: payload.after,
            headCommitId: payload.head_commit.id
        };
        commitObject.tag = tag;
        sn_devops.DevOpsLogger.log("GitHubIntegrationHandler._handleTagEvent() commitObject -> " + JSON.stringify(commitObject));
        return commitObject;
    },

    _isTagPushEvent: function(payload) {
        var tag_string = "refs/tags/";
		DevOpsLogger.log("includes() return value-->"+(payload.ref.includes(tag_string)));
        return payload && (payload.ref.includes(tag_string));
    },

    _isTagDeletionEvent: function(payload) {
        return this._isTagPushEvent(payload) && gs.nil(payload.head_commit.id);
    },

    type: 'GitHubIntegrationHandler'
};