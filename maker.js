var authConfig = {
  version: "1.0",
  dailyLimit: true, // Whether to limit each mailbox to submit requests only once a day
  client_id: '', // Google Client ID
  client_secret: '', // Google Client Secret
  refresh_token: '', // Refresh token
  domain: "", //College name to display
  black_list: ["example@gmail.com"]
};

var gd;

var today;

var html = `
<html lang="us-en">
<head>
    <meta charset="utf-8">
    <title>Google Shared Drive</title>
    <meta name="Mecha" content="noindex">
    <link rel="apple-touch-icon" sizes="180x180" href="USE YOUR OWN ICON">
    <link rel="icon" sizes="32x32" href="USE YOUR OWN ICON">
    <link rel="icon" sizes="16x16" href="USE YOUR OWN ICON">
    <link rel="mask-icon" href="USE YOUR OWN ICON" color="#5bbad5">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://raw.githubusercontent.com/LeeluPradhan/G-Index/master/css/mail-box-style.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://raw.githubusercontent.com/LeeluPradhan/G-Index/master/css/mail-box-style.css" crossorigin="anonymous">
</head>
<body style="background-image: url('Your Background Image');">
    <br>
    <center>
        <a href="/"><img src="Head Logo - Use transparent PNG" height="50px"></a>
        <br>
        <br>
    </center>
    <main>
        <div class="container min-height">
            <div>
                <div class="card waiting-screen" style="padding:50px">
                    <div class="card-block">
                        <div class="row">
                            <div class="col-sm-8 offset-sm-2 col-md-6 offset-md-3 text-center">
                                <h1><img src="//cdn.jsdelivr.net/gh/jscdn/images@master/google/google-logo-t.png" alt="Google Logo" style="width:50px;height:50px;"></h1> ${ authConfig.domain ? `
                                <h5>Create Shared Drive from:  ${authConfig.domain}</h5>` : "" }
                                <p>
                                    Multiple back-end API requests, the process takes a long time, please be patient!
                                    <br>
                                    <span style="color: red"><b>Never Submit Again, It'll ruin the System</b></span>
                                    <br>
                                    <span style="color: red"><b>PS: One Team Drive request per day per Email-id</b></span>
                                </p>
                                <br />
                                <div class="info-form text-left">
                                    <form id="teamDriveForm">
                                        <div class="form-group">
                                            <label for="teamDriveName" class="sr-only">
                                                Share Drive Name (can be changed later)
                                            </label>
                                            <input type="text" class="form-control" id="teamDriveName" placeholder="Name for your New Drive" />
                                        </div>
                                        <div class="form-group">
                                            <label for="emailAddress" class="sr-only">
                                                Your GMail Address
                                            </label>
                                            <input type="email" class="form-control" id="emailAddress" placeholder="username@gmail.com" />
                                        </div>
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="customTheme" value="" />
                                            <label class="form-check-label" for="customTheme">
                                                Custom Shared Drive Theme Header (can be changed later)
                                            </label>
                                        </div>
                                        <div id="customThemeSection" class="d-none">
                                            <div id="teamDriveThemePreview"></div>
                                            <div id="teamDriveThemeOptions">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="teamDriveTheme" id="teamDriveThemeOptionRandom" value="random" checked />
                                                    <label class="form-check-label" for="teamDriveThemeOptionRandom">
                                                        random
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <br />
                                        <center>
                                            <button type="submit" class="btn btn-primary">Submit</button> <a class="btn btn-danger" href="Change as per your requirement" role="button">Exit</a> <a class="btn btn-info" href="Change as per your requirement" role="button">Source</a></center>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="loadMe" tabindex="-1" role="dialog" aria-labelledby="loadMeLabel">
                    <div class="modal-dialog modal-sm" role="document">
                        <div class="modal-content">
                            <div class="modal-body text-center">
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" role="status">
                                        <span class="sr-only">Processing...</span>
                                    </div>
                                </div>
                                <div clas="loader-txt">
                                    <p>Processing...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
</body>
<script>
    var teamDriveThemes;
    $("input[id=customTheme]").change(function() {
        if ($(this).is(":checked")) {
            $("#customThemeSection").removeClass("d-none");
        } else {
            $("#customThemeSection").addClass("d-none");
            $("input[name=teamDriveTheme]")[0].click();
        }
    });
    $.get("/teamDriveThemes", function(json) {
                teamDriveThemes = json.teamDriveThemes;
                $.each(json.teamDriveThemes, function(i, item) {
                            $("#teamDriveThemeOptions").append(\`
        <div class="form-check">
           <input
            class="form-check-input"
            type="radio"
            name="teamDriveTheme"
            id="teamDriveThemeOption-\${item.id}"
            value="\${item.id}"
          />
          <label class="form-check-label" for="teamDriveThemeOption-\${item.id}">
           \${item.id}
          </label>
        </div>
        \`);
      });
      $("input[name=teamDriveTheme]").change(function() {
        var themeId = this.value;
        if (themeId === "random") {
          $("#teamDriveThemePreview").html("");
        } else {
          var theme = teamDriveThemes.find(function(t) {
            return t.id == themeId;
          });
          $("#teamDriveThemePreview").html(
            \`
          <div class="card" style="background-color: \${theme.colorRgb}">
            <img src="\${theme.backgroundImageLink}" class="card-img-top" alt="\${theme.id}" />
            <div class="card-body">
              <h5 class="card-text" style="color: white">
                \${theme.id}
              </h5>
            </div>
          </div>
      \`
          );
        }
      });
      $("#teamDriveForm").on("submit", function(event) {
        event.preventDefault();
        $("#loadMe").modal({
          backdrop: "static", //remove ability to close modal with click
          keyboard: false, //remove option to close with keyboard
          show: true //Display loader!
        });
        $.ajax({
          type: "POST",
          url: "/drive",
          data: JSON.stringify({
            teamDriveName: $("input[id=teamDriveName]").val(),
            teamDriveThemeId: $("input[name=teamDriveTheme]:checked").val(),
            emailAddress: $("input[id=emailAddress]").val()
          }),
          success: function(data) {
            $("#loadMe").modal("hide");
            alert("Success!");
          },
          error: function(request, status, error) {
            $("#loadMe").modal("hide");
            alert("Process Failed!" + request.responseText);
          },
          contentType: "application/json"
        });
      });
    });
</script>
<style type="text/css">
    .card-img-top {
        width: 100%;
        object-fit: cover;
    }
</style>
</main>
</body>
</html>
`;

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

var dailyLimit = [];

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  if (authConfig.dailyLimit) {
    if (!today) today = new Date().getDate();

    // Remove email rate limit every day
    if (new Date().getDate() != today) {
      today = new Date().getDate();
      dailyLimit.length = 0;
    }
  }

  if (gd == undefined) {
    gd = new googleDrive(authConfig);
  }
  let url = new URL(request.url);
  let path = url.pathname;

  switch (path) {
    case "/teamDriveThemes":
      let teamDriveThemes = await gd.getTeamDriveThemes();
      return new Response(JSON.stringify(teamDriveThemes), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    case "/drive":
      if (request.method === "POST") {
        const requestBody = await request.json();

        if (authConfig.dailyLimit) {
          if (dailyLimit.includes(requestBody.emailAddress)) {
            return new Response("Submit only one request per day.", {
              status: 429
            });
          } else {
            dailyLimit.push(requestBody.emailAddress);
          }
        }

        if (authConfig.black_list.includes(requestBody.emailAddress)) {
          return new Response("Failed", {
            status: 429
          });
        }

        try {
          let result = await gd.createAndShareTeamDrive(requestBody);
          return new Response("OK", {
            status: 200
          });
        } catch (err) {
          return new Response(err.toString(), {
            status: 500
          });
        }
      } else if (request.method === "OPTIONS") {
        return new Response("", {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      } else {
        return new Response("Bad Request", {
          status: 400
        });
      }
    default:
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });
  }
}
// https://stackoverflow.com/a/2117523
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // tslint:disable-next-line:one-variable-per-declaration
    const r = (Math.random() * 16) | 0,
      // tslint:disable-next-line:triple-equals
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class googleDrive {
  constructor(authConfig) {
    this.authConfig = authConfig;
    this.accessToken();
  }

  async getTeamDriveThemes() {
    let url = "https://www.googleapis.com/drive/v3/about";
    let requestOption = await this.requestOption();
    let params = { fields: "teamDriveThemes" };
    url += "?" + this.enQuery(params);
    let response = await fetch(url, requestOption);
    return await response.json();
  }

  async createAndShareTeamDrive(requestBody) {
    // Create team drive
    console.log("Creating TeamDrive");
    let url = "https://www.googleapis.com/drive/v3/drives";
    let requestOption = await this.requestOption(
      { "Content-Type": "application/json" },
      "POST"
    );
    let params = { requestId: uuidv4() };
    url += "?" + this.enQuery(params);
    let post_data = {
      name: requestBody.teamDriveName
    };
    if (
      requestBody.teamDriveThemeId &&
      requestBody.teamDriveThemeId !== "random"
    ) {
      post_data.themeId = requestBody.teamDriveThemeId;
    }
    requestOption.body = JSON.stringify(post_data);
    let response = await fetch(url, requestOption);
    let result = await response.json();
    const teamDriveId = result.id;
    console.log("Created TeamDrive ID", teamDriveId);

    // Get created drive user permission ID
    console.log(`Getting creator permission ID`);
    url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions`;
    params = { supportsAllDrives: true };
    params.fields = "permissions(id,emailAddress)";
    url += "?" + this.enQuery(params);
    requestOption = await this.requestOption();
    response = await fetch(url, requestOption);
    result = await response.json();
    const currentUserPermissionID = result.permissions[0].id;
    console.log(currentUserPermissionID);

    // Share team drive with email address
    console.log(`Sharing the team drive to ${requestBody.emailAddress}`);
    url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions`;
    params = { supportsAllDrives: true };
    url += "?" + this.enQuery(params);
    requestOption = await this.requestOption(
      { "Content-Type": "application/json" },
      "POST"
    );
    post_data = {
      role: "organizer",
      type: "user",
      emailAddress: requestBody.emailAddress
    };
    requestOption.body = JSON.stringify(post_data);
    response = await fetch(url, requestOption);
    await response.json();

    // Delete creator from the team drive
    console.log("Deleting creator from the team drive");
    url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions/${currentUserPermissionID}`;
    params = { supportsAllDrives: true };
    url += "?" + this.enQuery(params);
    requestOption = await this.requestOption({}, "DELETE");
    response = await fetch(url, requestOption);
    return await response.text();
  }

  async accessToken() {
    console.log("accessToken");
    if (
      this.authConfig.expires == undefined ||
      this.authConfig.expires < Date.now()
    ) {
      const obj = await this.fetchAccessToken();
      if (obj.access_token != undefined) {
        this.authConfig.accessToken = obj.access_token;
        this.authConfig.expires = Date.now() + 3500 * 1000;
      }
    }
    return this.authConfig.accessToken;
  }

  async fetchAccessToken() {
    console.log("fetchAccessToken");
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    const post_data = {
      client_id: this.authConfig.client_id,
      client_secret: this.authConfig.client_secret,
      refresh_token: this.authConfig.refresh_token,
      grant_type: "refresh_token"
    };

    let requestOption = {
      method: "POST",
      headers: headers,
      body: this.enQuery(post_data)
    };

    const response = await fetch(url, requestOption);
    return await response.json();
  }

  async requestOption(headers = {}, method = "GET") {
    const accessToken = await this.accessToken();
    headers["authorization"] = "Bearer " + accessToken;
    return { method: method, headers: headers };
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
