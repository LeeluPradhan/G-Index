// Load the necessary static in the head
document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mdui@0.4.3/dist/css/mdui.min.css">');
// markdown Standby
document.write('<script src="//cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js"></script>');
document.write('<style>.mdui-appbar .mdui-toolbar{height:56px;font-size:1pc}.mdui-toolbar>*{padding:0 6px;margin:0 2px}.mdui-toolbar>i{opacity:.5}.mdui-toolbar>.mdui-typo-headline{padding:0 1pc 0 0}.mdui-toolbar>i{padding:0}.mdui-toolbar>a:hover,a.active,a.mdui-typo-headline{opacity:1}.mdui-container{max-width:980px}.mdui-list-item{transition:none}.mdui-list>.th{background-color:initial}.mdui-list-item>a{width:100%;line-height:3pc}.mdui-list-item{margin:2px 0;padding:0}.mdui-toolbar>a:last-child{opacity:1}@media screen and (max-width:980px){.mdui-list-item .mdui-col-sm-3{display:none}.mdui-container{width:100%!important;margin:0}.mdui-toolbar>.mdui-typo-headline,.mdui-toolbar>a:last-child,.mdui-toolbar>i:first-child{display:block}}</style>');

if(dark){document.write('<style>* {box-sizing: border-box}body{color:rgba(255,255,255,.87);background-color:#333232}.mdui-theme-primary-'+main_color+' .mdui-color-theme{background-color:#232427!important}</style>');}

// Initialize the page and load the necessary resources
function init(){
    document.siteName = $('title').html();
    $('body').addClass("mdui-theme-primary-"+main_color+" mdui-theme-accent-"+accent_color);
    var html = "";
    html += `
    <header class="mdui-appbar mdui-color-theme">`
    if(dark){
        html += `
        <div id="nav" class="mdui-toolbar mdui-container mdui-text-color-white-text">
        </div>`;
    }else{
        html += `
        <div id="nav" class="mdui-toolbar mdui-container">
        </div>`;
    }
html += `
    </header>
        <div id="content" class="mdui-container"> 
        </div>`;
    $('body').html(html);
}

const Os = {
  isWindows: navigator.platform.toUpperCase().indexOf('WIN') > -1, // .includes
  isMac: navigator.platform.toUpperCase().indexOf('MAC') > -1,
  isMacLike: /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
  isIos: /(iPhone|iPod|iPad)/i.test(navigator.platform),
  isMobile: /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

function getDocumentHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  );
}

function render(path) {
  if (path.indexOf("?") > 0) {
    path = path.substr(0, path.indexOf("?"));
  }
  title(path);
  nav(path);
  // .../0: This
  var reg = /\/\d+:$/g;
  if (window.MODEL.is_search_page) {
    // Used to store the state of some scroll events
    window.scroll_status = {
      // Whether the scroll event is already bound
      event_bound: false,
      // "Scroll to the bottom, loading more data" event lock
      loading_lock: false
    };
    render_search_result_list()
  } else if (path.match(reg) || path.substr(-1) == '/') {
    // Used to store the state of some scroll events
    window.scroll_status = {
      // Whether the scroll event is already bound
      event_bound: false,
      // "Scroll to the bottom, loading more data" event lock
      loading_lock: false
    };
    list(path);
  } else {
    file(path);
  }
}


// Rendering title
function title(path) {
  path = decodeURI(path);
  var cur = window.current_drive_order || 0;
  var drive_name = window.drive_names[cur];
  path = path.replace(`/${cur}:`, '');
  // $('title').html(document.siteName + ' - ' + path);
  var model = window.MODEL;
  if (model.is_search_page)
    $('title').html(`${document.siteName} - ${drive_name} - Search Result for ${model.q} `);
  else
    $('title').html(`${document.siteName} - ${drive_name} - ${path}`);
}

// Render the navigation bar
function nav(path) {
  var model = window.MODEL;
  var html = "";
  var cur = window.current_drive_order || 0;
  html += `<a href="/${cur}:/" class="mdui-typo-headline folder">${document.siteName}</a>`;
  var names = window.drive_names;
  /*html += `<button class="mdui-btn mdui-btn-raised" mdui-menu="{target: '#drive-names'}"><i class="mdui-icon mdui-icon-left material-icons">share</i> ${names[cur]}</button>`;
  html += `<ul class="mdui-menu" id="drive-names" style="transform-origin: 0px 0px; position: fixed;">`;
  names.forEach((name, idx) => {
      html += `<li class="mdui-menu-item ${(idx === cur) ? 'mdui-list-item-active' : ''} "><a href="/${idx}:/" class="mdui-ripple">${name}</a></li>`;
  });
  html += `</ul>`;*/

  // change into select
  html += `<select class="mdui-select" onchange="window.location.href=this.value" mdui-select style="overflow:visible;padding-left:8px;padding-right:8px">`;
  names.forEach((name, idx) => {
    html += `<option value="/${idx}:/"  ${idx === cur ? 'selected="selected"' : ''} >${name}</option>`;
  });
  html += `</select>`;

  if (!model.is_search_page) {
    var arr = path.trim('/').split('/');
    var p = '/';
    if (arr.length > 1) {
      arr.shift();
      for (i in arr) {
        var n = arr[i];
        n = decodeURI(n);
        p += n + '/';
        if (n == '') {
          break;
        }
        html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a class="folder" href="/${cur}:${p}">${n}</a>`;
      }
    }
  }
  var search_text = model.is_search_page ? (model.q || '') : '';
  const isMobile = Os.isMobile;
  var search_bar = `<div class="mdui-toolbar-spacer"></div>
        <div id="search_bar" class="mdui-textfield mdui-textfield-expandable mdui-float-right ${model.is_search_page ? 'mdui-textfield-expanded' : ''}" style="max-width:${isMobile ? 300 : 400}px">
            <button class="mdui-textfield-icon mdui-btn mdui-btn-icon" onclick="if($('#search_bar').hasClass('mdui-textfield-expanded') && $('#search_bar_form>input').val()) $('#search_bar_form').submit();">
                <i class="mdui-icon material-icons">search</i>
            </button>
            <form id="search_bar_form" method="get" action="/${cur}:search">
            <input class="mdui-textfield-input mdui-text-color-white-text" type="text" name="q" placeholder="Search in current drive" value="${search_text}"/>
            </form>
            <button class="mdui-textfield-close mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">close</i></button>
        </div>`;

  // Personal or team
  if (model.root_type < 2) {
    // Show search box
    html += search_bar;
  }

  $('#nav').html(html);
  mdui.mutation();
  mdui.updateTextFields();
}

/**
 * Initiate POST request for listing
 * @param path Path
 * @param params Form params
 * @param resultCallback Success Result Callback
 * @param authErrorCallback Pass Error Callback
 */
function requestListPath(path, params, resultCallback, authErrorCallback) {
  var p = {
    password: params['password'] || null,
    page_token: params['page_token'] || null,
    page_index: params['page_index'] || 0
  };
  $.post(path, p, function (data, status) {
    var res = jQuery.parseJSON(data);
    if (res && res.error && res.error.code == '401') {
      // Password verification failed
      if (authErrorCallback) authErrorCallback(path)
    } else if (res && res.data) {
      if (resultCallback) resultCallback(res, path, p)
    }
  })
}

/**
 * Search POST request
 * @param params Form params
 * @param resultCallback Success callback
 */
function requestSearch(params, resultCallback) {
  var p = {
    q: params['q'] || null,
    page_token: params['page_token'] || null,
    page_index: params['page_index'] || 0
  };
  $.post(`/${window.current_drive_order}:search`, p, function (data, status) {
    var res = jQuery.parseJSON(data);
    if (res && res.data) {
      if (resultCallback) resultCallback(res, p)
    }
  })
}


// Render file list
function list(path) {
  var content = `
	<div id="head_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>
	 <div class="mdui-row">
	  <ul class="mdui-list">
	   <li class="mdui-list-item th">
	    <div class="mdui-col-xs-12 mdui-col-sm-7">
	     File
	<i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="more">expand_more</i>
	    </div>
	    <div class="mdui-col-sm-3 mdui-text-right">
	     Time
	<i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i>
	    </div>
	    <div class="mdui-col-sm-2 mdui-text-right">
	     Size
	<i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i>
	    </div>
	    </li>
	  </ul>
	 </div>
	 <div class="mdui-row">
	  <ul id="list" class="mdui-list">
	  </ul>
	  <div id="count" class="mdui-hidden mdui-center mdui-text-center mdui-m-b-3 mdui-typo-subheading mdui-text-color-blue-grey-500">Total <span class="number"></span> Item</div>
	 </div>
	 <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
	`;
  $('#content').html(content);

  var password = localStorage.getItem('password' + path);
  $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
  $('#readme_md').hide().html('');
  $('#head_md').hide().html('');

  /**
   * Callback after successful data return from column directory request
   * @param res Returned result (object)
   * @param path Requested path
   * @param prevReqParams Parameters used in the request
   */
  function successResultCallback(res, path, prevReqParams) {

    // Temporarily store nextPageToken and currentPageIndex in the list element
    $('#list')
      .data('nextPageToken', res['nextPageToken'])
      .data('curPageIndex', res['curPageIndex']);

    // Remove loading spinner
    $('#spinner').remove();

    if (res['nextPageToken'] === null) {
      // If it is the last page, unbind the scroll event, reset scroll_status, and append data
      $(window).off('scroll');
      window.scroll_status.event_bound = false;
      window.scroll_status.loading_lock = false;
      append_files_to_list(path, res['data']['files']);
    } else {
      // If it is not the last page, append data and bind the scroll event (if not already bound), update scroll_status
      append_files_to_list(path, res['data']['files']);
      if (window.scroll_status.event_bound !== true) {
        // Bind event, if not yet bound
        $(window).on('scroll', function () {
          var scrollTop = $(this).scrollTop();
          var scrollHeight = getDocumentHeight();
          var windowHeight = $(this).height();
          // Roll to the bottom
          if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
            /*
            When the event of scrolling to the bottom is triggered, if it is already loading at this time, the event is ignored;
            Otherwise, go to loading and occupy the loading lock, indicating that loading is in progress
             */
            if (window.scroll_status.loading_lock === true) {
              return;
            }
            window.scroll_status.loading_lock = true;

            // Show one loading spinner
            $(`<div id="spinner" class="mdui-spinner mdui-spinner-colorful mdui-center"></div>`)
              .insertBefore('#readme_md');
            mdui.updateSpinners();
            // mdui.mutation();

            let $list = $('#list');
            requestListPath(path, {
                password: prevReqParams['password'],
                page_token: $list.data('nextPageToken'),
                // Request next page
                page_index: $list.data('curPageIndex') + 1
              },
              successResultCallback,
              // The password is the same as before. Will not appear authError
              null
            )
          }
        });
        window.scroll_status.event_bound = true
      }
    }

    // After loading successfully and rendering new data successfully, release the loading lock so that you can continue to process the "scroll to bottom" event
    if (window.scroll_status.loading_lock === true) {
      window.scroll_status.loading_lock = false
    }
  }

  // Start requesting data from page 1
  requestListPath(path, {password: password},
    successResultCallback,
    function (path) {
      $('#spinner').remove();
      var pass = prompt("Access Denied, please enter the password", "");
      localStorage.setItem('password' + path, pass);
      if (pass != null && pass != "") {
        list(path);
      } else {
        history.go(-1);
      }
    });
}

/**
 * Append the data of the new page requested to the list
 * @param path path
 * @param files Requested results
 */
function append_files_to_list(path, files) {
  var $list = $('#list');
  // Is it the last page of data?
  var is_lastpage_loaded = null === $list.data('nextPageToken');
  var is_firstpage = '0' == $list.data('curPageIndex');

  html = "";
  let targetFiles = [];
  for (i in files) {
    var item = files[i];
    var p = path + item.name + '/';
    if (item['size'] == undefined) {
      item['size'] = "";
    }

    item['modifiedTime'] = utc2beijing(item['modifiedTime']);
    item['size'] = formatFileSize(item['size']);
    if (item['mimeType'] == 'application/vnd.google-apps.folder') {
      html += `<li class="mdui-list-item mdui-ripple"><a href="${p}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
    } else {
      var p = path + item.name;
      const filepath = path + item.name;
      var c = "file";
      // README is displayed after the last page is loaded, otherwise it will affect the scroll event
      if (is_lastpage_loaded && item.name == "README.md") {
        get_file(p, item, function (data) {
          markdown("#readme_md", data);
        });
      }
      if (item.name == "HEAD.md") {
        get_file(p, item, function (data) {
          markdown("#head_md", data);
        });
      }
      var ext = p.split('.').pop().toLowerCase();
      if ("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|bmp|jpg|jpeg|png|gif|m4a|mp3|flac|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|pdf|".indexOf(`|${ext}|`) >= 0) {
        targetFiles.push(filepath);
        p += "?a=view";
        c += " view";
      }
      html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a gd-type="${item.mimeType}" href="${p}" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
    }
  }

  /*let targetObj = {};
  targetFiles.forEach((myFilepath, myIndex) => {
      if (!targetObj[myFilepath]) {
          targetObj[myFilepath] = {
              filepath: myFilepath,
              prev: myIndex === 0 ? null : targetFiles[myIndex - 1],
              next: myIndex === targetFiles.length - 1 ? null : targetFiles[myIndex + 1],
          }
      }
  })
  // console.log(targetObj)
  if (Object.keys(targetObj).length) {
      localStorage.setItem(path, JSON.stringify(targetObj));
      // console.log(path)
  }*/

  if (targetFiles.length > 0) {
    let old = localStorage.getItem(path);
    let new_children = targetFiles;
    // Reset on page 1; otherwise append
    if (!is_firstpage && old) {
      let old_children;
      try {
        old_children = JSON.parse(old);
        if (!Array.isArray(old_children)) {
          old_children = []
        }
      } catch (e) {
        old_children = [];
      }
      new_children = old_children.concat(targetFiles)
    }

    localStorage.setItem(path, JSON.stringify(new_children))
  }

  // When it is page 1, remove the horizontal loading bar
  $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
  // When it is the last page, count and display the total number of items
  if (is_lastpage_loaded) {
    $('#count').removeClass('mdui-hidden').find('.number').text($list.find('li.mdui-list-item').length);
  }
}

/**
 * Render the search result list. There is a lot of repetitive code, but there are different logics in it.
 */
function render_search_result_list() {
  var content = `
	<div id="head_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>
	 <div class="mdui-row">
	  <ul class="mdui-list">
	   <li class="mdui-list-item th">
	    <div class="mdui-col-xs-12 mdui-col-sm-7">
	     File
	<i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="more">expand_more</i>
	    </div>
	    <div class="mdui-col-sm-3 mdui-text-right">
	     Time
	<i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i>
	    </div>
	    <div class="mdui-col-sm-2 mdui-text-right">
	     Size
	<i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i>
	    </div>
	    </li>
	  </ul>
	 </div>
	 <div class="mdui-row">
	  <ul id="list" class="mdui-list">
	  </ul>
	  <div id="count" class="mdui-hidden mdui-center mdui-text-center mdui-m-b-3 mdui-typo-subheading mdui-text-color-blue-grey-500">Total <span class="number"></span> Item</div>
	 </div>
	 <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
	`;
  $('#content').html(content);

  $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
  $('#readme_md').hide().html('');
  $('#head_md').hide().html('');

  /**
   * The callback after the search request successfully returns data
   * @param res Results returned(object)
   * @param path Requested path
   * @param prevReqParams Parameters used in the request
   */
  function searchSuccessCallback(res, prevReqParams) {

    // Temporarily store nextPageToken and currentPageIndex in the list element
    $('#list')
      .data('nextPageToken', res['nextPageToken'])
      .data('curPageIndex', res['curPageIndex']);

    // Removeloading spinner
    $('#spinner').remove();

    if (res['nextPageToken'] === null) {
      // If it is the last page, unbind the scroll event, reset scroll_status, and append data
      $(window).off('scroll');
      window.scroll_status.event_bound = false;
      window.scroll_status.loading_lock = false;
      append_search_result_to_list(res['data']['files']);
    } else {
      // If it is not the last page, append data and bind the scroll event (if not already bound), update scroll_status
      append_search_result_to_list(res['data']['files']);
      if (window.scroll_status.event_bound !== true) {
        // Bind event, if not yet bound
        $(window).on('scroll', function () {
          var scrollTop = $(this).scrollTop();
          var scrollHeight = getDocumentHeight();
          var windowHeight = $(this).height();
          // Roll to the bottom
          if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
            /*
            When the event of scrolling to the bottom is triggered, if it is already loading at this time, the event is ignored;
            Otherwise, go to loading and occupy the loading lock, indicating that loading is in progress
             */
            if (window.scroll_status.loading_lock === true) {
              return;
            }
            window.scroll_status.loading_lock = true;

            // Show one loading spinner
            $(`<div id="spinner" class="mdui-spinner mdui-spinner-colorful mdui-center"></div>`)
              .insertBefore('#readme_md');
            mdui.updateSpinners();
            // mdui.mutation();

            let $list = $('#list');
            requestSearch({
                q: window.MODEL.q,
                page_token: $list.data('nextPageToken'),
                // Request next page
                page_index: $list.data('curPageIndex') + 1
              },
              searchSuccessCallback
            )
          }
        });
        window.scroll_status.event_bound = true
      }
    }

    // After loading successfully and rendering new data successfully, release the loading lock so that you can continue to process the "scroll to bottom" event
    if (window.scroll_status.loading_lock === true) {
      window.scroll_status.loading_lock = false
    }
  }

  // Start requesting data from page 1
  requestSearch({q: window.MODEL.q}, searchSuccessCallback);
}

/**
 * Append a new page of search results
 * @param files
 */
function append_search_result_to_list(files) {
  var $list = $('#list');
  // Is it the last page of data?
  var is_lastpage_loaded = null === $list.data('nextPageToken');
  // var is_firstpage = '0' == $list.data('curPageIndex');

  html = "";

  for (i in files) {
    var item = files[i];
    if (item['size'] == undefined) {
      item['size'] = "";
    }

    item['modifiedTime'] = utc2beijing(item['modifiedTime']);
    item['size'] = formatFileSize(item['size']);
    if (item['mimeType'] == 'application/vnd.google-apps.folder') {
      html += `<li class="mdui-list-item mdui-ripple"><a id="${item['id']}" onclick="onSearchResultItemClick(this)" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
    } else {
      var c = "file";
      var ext = item.name.split('.').pop().toLowerCase();
      if ("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|bmp|jpg|jpeg|png|gif|m4a|mp3|flac|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
        c += " view";
      }
      html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a id="${item['id']}" gd-type="${item.mimeType}" onclick="onSearchResultItemClick(this)" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
    }
  }

  // When it is page 1, remove the horizontal loading bar
  $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
  // When it is the last page, count and display the total number of items
  if (is_lastpage_loaded) {
    $('#count').removeClass('mdui-hidden').find('.number').text($list.find('li.mdui-list-item').length);
  }
}

/**
 * Search result item click event
 * @param a_ele Clicked element
 */
function onSearchResultItemClick(a_ele) {
  var me = $(a_ele);
  var can_preview = me.hasClass('view');
  var cur = window.current_drive_order;
  var dialog = mdui.dialog({
    title: '',
    content: '<div class="mdui-text-center mdui-typo-title mdui-m-b-1">Getting target path...</div><div class="mdui-spinner mdui-spinner-colorful mdui-center"></div>',
    // content: '<div class="mdui-spinner mdui-spinner-colorful mdui-center"></div>',
    history: false,
    modal: true,
    closeOnEsc: true
  });
  mdui.updateSpinners();

  // Request to get the path
  $.post(`/${cur}:id2path`, {id: a_ele.id}, function (data) {
    if (data) {
      dialog.close();
      var href = `/${cur}:${data}${can_preview ? '?a=view' : ''}`;
      dialog = mdui.dialog({
        title: '<i class="mdui-icon material-icons">☞ </i>Target path',
        content: `<a href="${href}">${data}</a>`,
        history: false,
        modal: true,
        closeOnEsc: true,
        buttons: [
          {
            text: 'Open', onClick: function () {
              window.location.href = href
            }
          }, {
            text: 'Open in new tab', onClick: function () {
              window.open(href)
            }
          }
          , {text: 'Cancel'}
        ]
      });
      return;
    }
    dialog.close();
    dialog = mdui.dialog({
      title: '<i class="mdui-icon material-icons">&#xe811;</i>Failed to get the target path',
      content: 'o(╯□╰)o It may be because this item does not exist in the disk! It may also be because the file [Shared with me] has not been added to Personal Drive!',
      history: false,
      modal: true,
      closeOnEsc: true,
      buttons: [
        {text: 'WTF ???'}
      ]
    });
  })
}

function get_file(path, file, callback) {
  var key = "file_path_" + path + file['modifiedTime'];
  var data = localStorage.getItem(key);
  if (data != undefined) {
    return callback(data);
  } else {
    $.get(path, function (d) {
      localStorage.setItem(key, d);
      callback(d);
    });
  }
}


// File display? A = view
function file(path) {
  var name = path.split('/').pop();
  var ext = name.split('.').pop().toLowerCase().replace(`?a=view`, "").toLowerCase();
  if ("|html|php|css|go|java|js|json|txt|sh|md|".indexOf(`|${ext}|`) >= 0) {
    return file_code(path);
  }

  if ("|mp4|webm|avi|".indexOf(`|${ext}|`) >= 0) {
    return file_video(path);
  }

  if ("|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
    return file_video(path);
  }

  if ("|mp3|flac|wav|ogg|m4a|".indexOf(`|${ext}|`) >= 0) {
    return file_audio(path);
  }

  if ("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0) {
    return file_image(path);
  }

  if ('pdf' === ext) return file_pdf(path);
}

// Document display |html|php|css|go|java|js|json|txt|sh|md|
function file_code(path) {
  var type = {
    "html": "html",
    "php": "php",
    "css": "css",
    "go": "golang",
    "java": "java",
    "js": "javascript",
    "json": "json",
    "txt": "Text",
    "sh": "sh",
    "md": "Markdown",
  };
  var name = path.split('/').pop();
  var ext = name.split('.').pop().toLowerCase();
  var href = window.location.origin + path;
  var content = `
<div class="mdui-container">
<pre id="editor" ></pre>
</div>
<div class="mdui-textfield">
	<label class="mdui-textfield-label">Download Link</label>
	<input class="mdui-textfield-input" type="text" value="${href}"/>
</div>
<a href="${href}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
<script src="https://cdn.staticfile.org/ace/1.4.7/ace.js"></script>
<script src="https://cdn.staticfile.org/ace/1.4.7/ext-language_tools.js"></script>
	`;
  $('#content').html(content);

  $.get(path, function (data) {
    $('#editor').html($('<div/>').text(data).html());
    var code_type = "Text";
    if (type[ext] != undefined) {
      code_type = type[ext];
    }
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/ambiance");
    editor.setFontSize(18);
    editor.session.setMode("ace/mode/" + code_type);

    //Autocompletion
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      maxLines: Infinity
    });
  });
}
function copyToClipboard(str) {
  const $temp = $("<input>");
  $("body").append($temp);
  $temp.val(str).select();
  document.execCommand("copy");
  $temp.remove();
}
// Document display video |mp4|webm|avi|
function file_video(path) {
 const url = window.location.origin + path;
  let player_items = [
    {
      text: 'MXPlayer(Free)',
      href: `intent:${url}#Intent;package=com.mxtech.videoplayer.ad;S.title=${path};end`,
    },
    {
      text: 'MXPlayer(Pro)',
      href: `intent:${url}#Intent;package=com.mxtech.videoplayer.pro;S.title=${path};end`,
    },
    {
      text: 'nPlayer',
      href: `nplayer-${url}`,
    },
    {
      text: 'VLC',
      href: `vlc://${url}`,
    },
    {
      text: 'PotPlayer',
      href: `potplayer://${url}`
    }
  ]
    .map(it => `<li class="mdui-menu-item"><a href="${it.href}" class="mdui-ripple">${it.text}</a></li>`)
    .join('');
  player_items += `<li class="mdui-divider"></li>
                   <li class="mdui-menu-item"><a id="copy-link" class="mdui-ripple">Copy Link</a></li>`;
  const playBtn = `
      <button class="mdui-btn mdui-ripple mdui-color-theme-accent" mdui-menu="{target:'#player-items'}">
        <i class="mdui-icon material-icons">&#xe039;</i>Play From External Player<i class="mdui-icon material-icons">&#xe5cf;</i>
      </button>
      
      <ul class="mdui-menu" id="player-items">${player_items}</ul>`;

  const content = `
  
<div class="mdui-container-fluid">
	<br>
	<video class="mdui-video-fluid mdui-center" preload controls>
	  <source src="${url}" type="video/mp4">
	</video>
	<br>${playBtn}
	<!-- Fixed label -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Download Link</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML Refrence Adress</label>
	  <textarea class="mdui-textfield-input"><video><source src="${url}" type="video/mp4"></video></textarea>
	</div>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
  $('#content').html(content);
  $('#copy-link').on('click', () => {
    copyToClipboard(url);
    mdui.snackbar('Copied To Clipboard!');
  });
}

// File display Audio |mp3|flac|m4a|wav|ogg|
function file_audio(path) {
  var url = window.location.origin + path;
  var content = `
<div class="mdui-container-fluid">
	<br>
	<audio class="mdui-center" preload controls>
	  <source src="${url}"">
	</audio>
	<br>
	<!-- Fixed label -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Download link</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML Reference address</label>
	  <textarea class="mdui-textfield-input"><audio><source src="${url}"></audio></textarea>
	</div>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
  $('#content').html(content);
}

// Document display pdf  pdf
function file_pdf(path) {
  const url = window.location.origin + path;
  const inline_url = `${url}?inline=true`
  const file_name = decodeURI(path.slice(path.lastIndexOf('/') + 1, path.length))
  var content = `
	<object data="${inline_url}" type="application/pdf" name="${file_name}" style="width:100%;height:94vh;"><embed src="${inline_url}" type="application/pdf"/></object>
    <a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
  $('#content').removeClass('mdui-container').addClass('mdui-container-fluid').css({padding: 0}).html(content);
}

// picture display
function file_image(path) {
  var url = window.location.origin + path;
  // console.log(window.location.pathname)
  const currentPathname = window.location.pathname
  const lastIndex = currentPathname.lastIndexOf('/');
  const fatherPathname = currentPathname.slice(0, lastIndex + 1);
  // console.log(fatherPathname)
  let target_children = localStorage.getItem(fatherPathname);
  // console.log(`fatherPathname: ${fatherPathname}`);
  // console.log(target_children)
  let targetText = '';
  if (target_children) {
    try {
      target_children = JSON.parse(target_children);
      if (!Array.isArray(target_children)) {
        target_children = []
      }
    } catch (e) {
      console.error(e);
      target_children = [];
    }
    if (target_children.length > 0 && target_children.includes(path)) {
      let len = target_children.length;
      let cur = target_children.indexOf(path);
      // console.log(`len = ${len}`)
      // console.log(`cur = ${cur}`)
      let prev_child = (cur - 1 > -1) ? target_children[cur - 1] : null;
      let next_child = (cur + 1 < len) ? target_children[cur + 1] : null;
      targetText = `
            <div class="mdui-container">
                <div class="mdui-row-xs-2 mdui-m-b-1">
                    <div class="mdui-col">
                        ${prev_child ? `<button id="leftBtn" data-filepath="${prev_child}" class="mdui-btn mdui-btn-block mdui-color-theme-accent mdui-ripple">Previous</button>` : `<button class="mdui-btn mdui-btn-block mdui-color-theme-accent mdui-ripple" disabled>Previous</button>`}
                    </div>
                    <div class="mdui-col">
                        ${next_child ? `<button id="rightBtn"  data-filepath="${next_child}" class="mdui-btn mdui-btn-block mdui-color-theme-accent mdui-ripple">Next</button>` : `<button class="mdui-btn mdui-btn-block mdui-color-theme-accent mdui-ripple" disabled>Next</button>`}
                    </div>
                </div>
            </div>
            `;
    }
    // <div id="btns" >
    //             ${targetObj[path].prev ? `<span id="leftBtn" data-direction="left" data-filepath="${targetObj[path].prev}"><i class="mdui-icon material-icons">&#xe5c4;</i><span style="margin-left: 10px;">Prev</span></span>` : `<span style="cursor: not-allowed;color: rgba(0,0,0,0.2);margin-bottom:20px;"><i class="mdui-icon material-icons">&#xe5c4;</i><span style="margin-left: 10px;">Prev</span></span>`}
    //             ${targetObj[path].next ? `<span id="rightBtn" data-direction="right"  data-filepath="${targetObj[path].next}"><i class="mdui-icon material-icons">&#xe5c8;</i><span style="margin-left: 10px;">Next</span></span>` : `<span style="cursor: not-allowed;color: rgba(0,0,0,0.2);"><i class="mdui-icon material-icons">&#xe5c4;</i><span style="margin-left: 10px;">Prev</span></span>`}
    // </div>
  }
  var content = `
<div class="mdui-container-fluid">
    <br>
    <div id="imgWrap">
        ${targetText}
	    <img class="mdui-img-fluid" src="${url}"/>
    </div>
	<br>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Download link</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML Reference address</label>
	  <input class="mdui-textfield-input" type="text" value="<img src='${url}' />"/>
	</div>
        <div class="mdui-textfield">
	  <label class="mdui-textfield-label">Markdown Reference address</label>
	  <input class="mdui-textfield-input" type="text" value="![](${url})"/>
	</div>
        <br>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
    `;
  //my code
  $('#content').html(content);
  $('#leftBtn, #rightBtn').click((e) => {
    let target = $(e.target);
    if (['I', 'SPAN'].includes(e.target.nodeName)) {
      target = $(e.target).parent();
    }
    const filepath = target.attr('data-filepath');
    const direction = target.attr('data-direction');
    //console.log (`$ {direction} turn page $ {filepath}`);
    file(filepath)
  });
}


//Time conversion
function utc2beijing(utc_datetime) {
  // Convert to normal time format year-month-day hour: minute: second
  var T_pos = utc_datetime.indexOf('T');
  var Z_pos = utc_datetime.indexOf('Z');
  var year_month_day = utc_datetime.substr(0, T_pos);
  var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

  // Processing becomes timestamp
  timestamp = new Date(Date.parse(new_datetime));
  timestamp = timestamp.getTime();
  timestamp = timestamp / 1000;

  // 8 hours more, Beijing time is eight more time zones than UTC time
  var unixtimestamp = timestamp + 8 * 60 * 60;

  // Timestamp to time
  var unixtimestamp = new Date(unixtimestamp * 1000);
  var year = 1900 + unixtimestamp.getYear();
  var month = "0" + (unixtimestamp.getMonth() + 1);
  var date = "0" + unixtimestamp.getDate();
  var hour = "0" + unixtimestamp.getHours();
  var minute = "0" + unixtimestamp.getMinutes();
  var second = "0" + unixtimestamp.getSeconds();
  return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length)
    + " " + hour.substring(hour.length - 2, hour.length) + ":"
    + minute.substring(minute.length - 2, minute.length) + ":"
    + second.substring(second.length - 2, second.length);
}

// bytes Adaptive conversion to KB, MB, GB
function formatFileSize(bytes) {
  if (bytes >= 1000000000) {
    bytes = (bytes / 1000000000).toFixed(2) + ' GB';
  } else if (bytes >= 1000000) {
    bytes = (bytes / 1000000).toFixed(2) + ' MB';
  } else if (bytes >= 1000) {
    bytes = (bytes / 1000).toFixed(2) + ' KB';
  } else if (bytes > 1) {
    bytes = bytes + ' bytes';
  } else if (bytes == 1) {
    bytes = bytes + ' byte';
  } else {
    bytes = '';
  }
  return bytes;
}

String.prototype.trim = function (char) {
  if (char) {
    return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
  }
  return this.replace(/^\s+|\s+$/g, '');
};


// README.md HEAD.md stand by
function markdown(el, data) {
  if (window.md == undefined) {
    //$.getScript('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js',function(){
    window.md = window.markdownit();
    markdown(el, data);
    //});
  } else {
    var html = md.render(data);
    $(el).show().html(html);
  }
}

// Listen for fallback events
window.onpopstate = function () {
  var path = window.location.pathname;
  render(path);
}


$(function () {
  init();
  var path = window.location.pathname;
  /*$("body").on("click", '.folder', function () {
      var url = $(this).attr('href');
      history.pushState(null, null, url);
      render(url);
      return false;
  });
  $("body").on("click", '.view', function () {
      var url = $(this).attr('href');
      history.pushState(null, null, url);
      render(url);
      return false;
  });*/

  render(path);
});
