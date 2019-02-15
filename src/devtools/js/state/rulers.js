import AppManager from '../state.js'

const TAB_SIZE_EVAL = {
  'vertical':   '[document.documentElement.clientWidth, document.documentElement.scrollLeft]',
  'horizontal': '[document.documentElement.clientHeight, document.documentElement.scrollTop]'
}

// Base DOM actions for the ruler UI
// ----------------------------------------------------------------------------
function toggle (e) {
  const id = e.target.value
  const ruler = AppManager.state.rulers[id]

  AppManager.ruler.update({id, active: !ruler.active})
}

function update (e) {
  const [id, name] = e.target.name.split('-')
  const ruler = { id }

  ruler[name] = e.target.type === 'number'   ? Number(e.target.value)
              : e.target.type === 'checkbox' ? e.target.checked
              : e.target.value

  AppManager.ruler.update(ruler, true)
}

function add (direction) {
  const orientation = direction === 'vertical' ? 'vertical' : 'horizontal'

  browser.devtools.inspectedWindow
    .eval(TAB_SIZE_EVAL[orientation])
    .then(result => {
      // Chrome and Firefox do not follow the same convention here
      const [size, scroll] = Array.isArray(result[0]) ? result[0] : result;

      AppManager.ruler.add({
        id: `r${Math.random().toString(36).substr(2, 9)}`,
        active:      true,
        color:       '#FF0000',
        opacity:     100,
        position:    Math.round(scroll + size/2),
        orientation
      })
    })
}

function remove (e) {
  AppManager.ruler.remove(e.target.value)
}

function exportall () {
    if (!AppManager.state.rulers) { return }

    // get all rulers
    let _rulers = AppManager.state.rulers;

    // convert to JSON
    let _json_output = JSON.stringify( _rulers );

    // initiate user download
    var exportName = 'rulers';
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent( _json_output );
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importrulers () {
    // add event listener to file input to handle file processing
    var _file_input = document.getElementById('import_input');
    _file_input.addEventListener('change', handleFileSelect, true);
    // trigger file input to browse for file
    _file_input.click();
}

function handleFileSelect () {
    var _file_input = document.getElementById('import_input');
    if( _file_input.value == '' ) {
      return false;
    }
    console.log('importing rulers');
    var files = _file_input.files; // FileList object
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                //console.log('e readAsText = ', e);
                //console.log('e readAsText target = ', e.target);
                try {
                    var json = JSON.parse(e.target.result);
                    //console.log(json);
                    // loop over imported data and add rulers
                    for(var i in json) {
                      var orientation = json[i].orientation;
                      AppManager.ruler.add({
                        id: `r${Math.random().toString(36).substr(2, 9)}`,
                        active:      json[i].active,
                        color:       json[i].color,
                        opacity:     json[i].opacity,
                        position:    json[i].position,
                        orientation
                      });
                    }
                    // success/fail message?
                } catch (ex) {
                    alert('exception when trying to parse json = ' + ex);
                }
            }
        })(f);
        reader.readAsText(f);
    }
}

// Bind actions to state
// ----------------------------------------------------------------------------
AppManager.state.ui.ruler = { add, toggle, remove, update, exportall, importrulers, handleFileSelect }
