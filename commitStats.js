var commitStats = {
    "sha": "c0e40d57a1accb9240edadee21cf39acf989aabe",
    "node_id": "MDY6Q29tbWl0MzQzNjc0MzUyOmMwZTQwZDU3YTFhY2NiOTI0MGVkYWRlZTIxY2YzOWFjZjk4OWFhYmU=",
    "commit": {
      "author": {
        "name": "kiranlakhani20",
        "email": "55124757+kiranlakhani20@users.noreply.github.com",
        "date": "2021-03-26T11:43:26Z"
      },
      "committer": {
        "name": "kiranlakhani20",
        "email": "55124757+kiranlakhani20@users.noreply.github.com",
        "date": "2021-03-26T11:43:26Z"
      },
      "message": "new instance single commit",
      "tree": {
        "sha": "ee09a5de31292fe87ed58a287669d6a88104a7c2",
        "url": "https://api.github.com/repos/kiranlakhani20/revert-commit/git/trees/ee09a5de31292fe87ed58a287669d6a88104a7c2"
      },
      "url": "https://api.github.com/repos/kiranlakhani20/revert-commit/git/commits/c0e40d57a1accb9240edadee21cf39acf989aabe",
      "comment_count": 0,
      "verification": {
        "verified": false,
        "reason": "unsigned",
        "signature": null,
        "payload": null
      }
    },
    "url": "https://api.github.com/repos/kiranlakhani20/revert-commit/commits/c0e40d57a1accb9240edadee21cf39acf989aabe",
    "html_url": "https://github.com/kiranlakhani20/revert-commit/commit/c0e40d57a1accb9240edadee21cf39acf989aabe",
    "comments_url": "https://api.github.com/repos/kiranlakhani20/revert-commit/commits/c0e40d57a1accb9240edadee21cf39acf989aabe/comments",
    "author": {
      "login": "kiranlakhani20",
      "id": 55124757,
      "node_id": "MDQ6VXNlcjU1MTI0NzU3",
      "avatar_url": "https://avatars.githubusercontent.com/u/55124757?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/kiranlakhani20",
      "html_url": "https://github.com/kiranlakhani20",
      "followers_url": "https://api.github.com/users/kiranlakhani20/followers",
      "following_url": "https://api.github.com/users/kiranlakhani20/following{/other_user}",
      "gists_url": "https://api.github.com/users/kiranlakhani20/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/kiranlakhani20/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/kiranlakhani20/subscriptions",
      "organizations_url": "https://api.github.com/users/kiranlakhani20/orgs",
      "repos_url": "https://api.github.com/users/kiranlakhani20/repos",
      "events_url": "https://api.github.com/users/kiranlakhani20/events{/privacy}",
      "received_events_url": "https://api.github.com/users/kiranlakhani20/received_events",
      "type": "User",
      "site_admin": false
    },
    "committer": {
      "login": "kiranlakhani20",
      "id": 55124757,
      "node_id": "MDQ6VXNlcjU1MTI0NzU3",
      "avatar_url": "https://avatars.githubusercontent.com/u/55124757?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/kiranlakhani20",
      "html_url": "https://github.com/kiranlakhani20",
      "followers_url": "https://api.github.com/users/kiranlakhani20/followers",
      "following_url": "https://api.github.com/users/kiranlakhani20/following{/other_user}",
      "gists_url": "https://api.github.com/users/kiranlakhani20/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/kiranlakhani20/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/kiranlakhani20/subscriptions",
      "organizations_url": "https://api.github.com/users/kiranlakhani20/orgs",
      "repos_url": "https://api.github.com/users/kiranlakhani20/repos",
      "events_url": "https://api.github.com/users/kiranlakhani20/events{/privacy}",
      "received_events_url": "https://api.github.com/users/kiranlakhani20/received_events",
      "type": "User",
      "site_admin": false
    },
    "parents": [
      {
        "sha": "4efe909fe19c07e86f4e38b952936d6407fb233a",
        "url": "https://api.github.com/repos/kiranlakhani20/revert-commit/commits/4efe909fe19c07e86f4e38b952936d6407fb233a",
        "html_url": "https://github.com/kiranlakhani20/revert-commit/commit/4efe909fe19c07e86f4e38b952936d6407fb233a"
      }
    ],
    "stats": {
      "total": 3,
      "additions": 2,
      "deletions": 1
    },
    "files": [
      {
        "sha": "3dbe3b3fea99cbd12a5b36100c34da4dc438b3d1",
        "filename": "transform1",
        "status": "modified",
        "additions": 2,
        "deletions": 1,
        "changes": 3,
        "blob_url": "https://github.com/kiranlakhani20/revert-commit/blob/c0e40d57a1accb9240edadee21cf39acf989aabe/transform1",
        "raw_url": "https://github.com/kiranlakhani20/revert-commit/raw/c0e40d57a1accb9240edadee21cf39acf989aabe/transform1",
        "contents_url": "https://api.github.com/repos/kiranlakhani20/revert-commit/contents/transform1?ref=c0e40d57a1accb9240edadee21cf39acf989aabe",
        "patch": "@@ -1 +1,2 @@\n-hi\n\\ No newline at end of file\n+hi\n+pushing a commit\n\\ No newline at end of file"
      }
    ]
  }
  var commitStatsJSON = JSON.stringify(commitStats);
  console.log(commitStats.stats.additions);
  for(var i=0;i<commitStats.files.length;i++){
      console.log(commitStats.files[i].status);
      console.log(commitStats.files[i].filename);
  }