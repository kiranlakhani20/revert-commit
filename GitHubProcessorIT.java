package com.snc.it.devops.unit.codetool;

import org.junit.ClassRule;
import org.junit.runner.RunWith;

import com.snc.core_automation.connections.ScriptableConnectionInfo;
import com.snc.core_automation.connections.ScriptableConnectionInfoProvider;
import com.snc.devops.core.DevOpsTestBase;
import com.snc.glide.it.annotations.WithExtPoint;
import com.snc.glide.it.annotations.WithExtPoints;
import com.snc.glide.it.annotations.WithScopedApp;
import com.snc.glide.it.annotations.WithScript;
import com.snc.glide.it.rules.GlideEnvironment;
import com.snc.glide.it.runners.JSRunner;
import com.snc.sdlc.annotations.Story;

@Story({"STRY"})
@RunWith(JSRunner.class)
@WithScopedApp(value = {"app-devops"})
@WithExtPoints({
    @WithExtPoint(clazz = ScriptableConnectionInfoProvider.class, plugin = "com.snc.core.automation.connection_credential", point = "com.glide.scriptable_object",
		namespace = "sn_cc"),
	@WithExtPoint(clazz = ScriptableConnectionInfo.class, plugin = "com.snc.core.automation.connection_credential", point = "com.glide.scriptable_object",
		namespace = "sn_cc")})
@WithScript(value = "com/snc/it/devops/codetool/GitHubProcessorTest.js", include = {"com/snc/it/devops/util/DevOpsTestHelper.js",
		"com/snc/it/devops/util/DevOpsTestConstants.js", "com/snc/it/devops/util/DevOpsConnectionUtil.js", "com/snc/it/devops/codetool/util/DevOpsCodeToolUtil.js",
		"com/snc/it/devops/util/DevOpsDateUtils.js"}, scope = "sn_devops")
public class GitHubProcessorIT extends DevOpsTestBase {
	@ClassRule
	public static final GlideEnvironment fEnv = new GlideEnvironment();
}
