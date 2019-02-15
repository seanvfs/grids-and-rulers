import { wire } from '../../../lib/hyperhtml.js'

function FileInput (param) {
  return wire(param)`
    <input  class=${param.type}
    		type="file"
    		id="import_input"
    		name="import_input"
            onclick=${param.action}
    />`
}

export default FileInput
