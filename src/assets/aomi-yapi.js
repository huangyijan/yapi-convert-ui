/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/* eslint-disable no-useless-escape */
var ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g; // 獲取接口名稱
var illegalRegex = /[^a-zA-Z0-9]/g; // 用来剔除不合法的符号
var longBiasRegex = /\/[^\/]*/; // 处理多个“/”地址的情况
var pathHasParamsRegex = /\/\{([a-zA-Z0-9]*)\}/g; // 獲取接口参数名稱
var NormalType = ['boolean', 'string', 'number', 'object', 'array'];
var quotaRegex = /(,)\s*\n*.*\}/g; // 匹配json字符串最后一个逗号
var illegalJsonRegex = /(\/\/\s.*)\n/g; // 非法json注释匹配

/** 将下划线和短横线命名的重命名为驼峰命名法 */
var toHumpName = function (str) {
    return str.replace(ApiNameRegex, function (_keb, item) { return item.toUpperCase(); });
};
/** hasOwnProperty太长了，写一个代理当简写 */
var hasProperty = function (obj, key) {
    if (!obj)
        return false;
    return Object.prototype.hasOwnProperty.call(obj, key);
};
var dealApiObj = function (data) {
    if (hasProperty(data, 'properties')) {
        var description = data.description;
        data = data.properties;
        if (data instanceof Object && hasProperty(data, 'name') && hasProperty(data, 'ordinal')) {
            // 对状态对象处理，yapi 文档自动生成问题，状态字段一般都是呈现出object，实际为string
            data = { type: 'string', description: description, default: '', ordinal: true };
        }
    }
    return data;
};
/** 数据结构处理后台嵌套的properties层，只是考虑到大部分的情况咋们会封装，后面考虑将这个能力交给用户自定义TODO */
var removeProperties = function (data) {
    data = dealApiObj(data);
    for (var item in data) {
        var type = getTypeByValue(data[item]);
        if (type === 'object')
            data[item] = removeProperties(data[item]);
    }
    return data;
};
/** 判断api数据里面的数据类型 */
var getTypeByValue = function (value) {
    if (value === null)
        return 'string';
    var jsType = typeof value;
    switch (jsType) {
        case 'object': // 引用类型都是object，需要处理不同引用类型
            return value.constructor === Array ? 'array' : 'object';
        case 'undefined':
            return 'any';
        default:
            return jsType;
    }
};
/** 获取请求体（body）传输参数 */
var getLegalJson = function (reqBody) {
    if (!reqBody || reqBody.length < 20)
        return '';
    var isIllegalJsonStr = illegalJsonRegex.test(reqBody); //判断后台返回的字符串是不是合法json字符串
    try {
        if (!isIllegalJsonStr) {
            return JSON.parse(reqBody);
        }
        else {
            var dealStr = reqBody.replace(illegalJsonRegex, '\n'); // 删除注释
            var removeLestQuotaStr = dealStr.replace(quotaRegex, '}'); // 删除多余的逗号
            return JSON.parse(removeLestQuotaStr);
        }
    }
    catch (error) {
        // console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释, TODO
        return ''; // 总有一些意外的情况没有考虑到，当字符创处理
    }
};
/** 获取通用请求头 */
var getHeader = function () {
    var config = global.apiConfig;
    var token = config.token;
    var userId = config.userId;
    var HeaderConfig = {
        Cookie: "_yapi_token=".concat(token, "; _yapi_uid=").concat(userId),
        Accept: 'application/json, text/plain, */*'
    };
    return HeaderConfig;
};

/** 后台类型转前端类型 */
var transformType = function (serviceType) {
    serviceType = String(serviceType);
    switch (serviceType) {
        case 'integer':
            return 'number';
        case 'bool':
            return 'boolean';
        default:
            if (NormalType.includes(serviceType.toLowerCase()))
                return serviceType;
            else
                return 'any';
    }
};
/** 获取合适的参数类型 */
var getSuitableType = function (value) {
    var valueType = typeof value;
    switch (valueType) {
        case 'object':
            if (value === null)
                return 'any';
            if (hasProperty(value, 'type'))
                return transformType(value.type);
            if (hasProperty(value, 'default'))
                return getTypeByValue(value.default);
            return 'any';
        case 'undefined':
            return 'any';
        case 'number':
        case 'string':
        default:
            return String(valueType);
    }
};
/** 获取合适的参数描述 */
var getSuitDescription = function (value) {
    var description = '';
    if (hasProperty(value, 'description')) {
        description = value.description || '';
    }
    return description;
};
var getSuitableDefault = function (value) {
    /** 如果是String类型的话没有多大必要显示Example: String. 多此一举了 */
    function removeTypeDefault(defaultStr) {
        if (String(defaultStr).trim().toLowerCase() === 'string')
            return '';
        return String(defaultStr);
    }
    var valueType = typeof value;
    switch (valueType) {
        case 'object':
            if (hasProperty(value, 'default'))
                return removeTypeDefault(value.default);
            if (hasProperty(value, 'example'))
                return removeTypeDefault(value.example);
            return '';
        case 'boolean':
        case 'number':
            return String(value);
        case 'string':
            return removeTypeDefault(value);
        default:
            return '';
    }
};
var getSuitableTsTypeNote = function (description, example) {
    if (!description && !example)
        return '';
    var desc = description || '';
    var ex = example ? "   Example: ".concat(example) : '';
    return "    /**  ".concat(desc).concat(ex, "  */\n");
};
var getSuitableTsType = function (key, type) { return "    ".concat(key, "?: ").concat(type, "\n"); };
var getSuitableJsdocProperty = function (key, type, description, example) {
    var descriptionStr = description || '';
    var exampleStr = example ? " Example: ".concat(example) : '';
    return "  * @property { ".concat(type, " } [").concat(key, "] ").concat(descriptionStr).concat(exampleStr, " \n");
};
var getSuitableTsInterface = function (noteName, noteStr, childNote) { return "interface ".concat(noteName, " {\n").concat(noteStr, "}\n").concat(childNote || ''); };
var getSuitableJsdocType = function (noteName, noteStr, childNote) { return "/** \n  * @typedef ".concat(noteName, "\n").concat(noteStr, "  */\n").concat(childNote || ''); };
/** 处理缩进 */
function withTab(code, tab, tabSize) {
    if (tabSize === void 0) { tabSize = 2; }
    var oneTab = Array(tabSize).fill(' ').join('');
    return Array(tab).fill(oneTab).join('') + code;
}
/** 字符串拼接，缩进处理 */
var format = function (lines, tabSize) {
    if (tabSize === void 0) { tabSize = 2; }
    var tab = 0;
    var codeString = lines.map(function (line) {
        if (line.trim().startsWith('}'))
            tab--;
        var code = withTab(line, tab, tabSize);
        if (line.endsWith('{'))
            tab++;
        return code;
    })
        .join('\n');
    return codeString;
};

/** 获取处理地址的baseUrl */
var getApiBaseUrl = function (project) {
    var baseUrl = '';
    var prefix = project.prefix, projectBaseConfig = project.projectBaseConfig;
    if (projectBaseConfig === null || projectBaseConfig === void 0 ? void 0 : projectBaseConfig.basepath)
        baseUrl = projectBaseConfig.basepath;
    if (prefix)
        baseUrl = prefix.endsWith('/') ? prefix.slice(0, prefix.length - 1) : prefix; // 兼容两种写法
    return baseUrl;
};
/** 接口名决策方案：如果有参数先去除参数，然后把接口path剩余数据转成驼峰命名，缺点：接口path如果太长，命名也会比较长 */
var getApiName = function (path, method) {
    path = path.replace(pathHasParamsRegex, '');
    // 处理名字太长
    var biasCount = --path.split('/').length;
    if (biasCount >= 3)
        path = path.replace(longBiasRegex, '');
    path = path.replace(ApiNameRegex, function (_, item) { return item.toUpperCase(); });
    // 防止restful API 导致命名相同
    return method.toLowerCase() + path.replace(illegalRegex, '');
};
/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据
 * @returns {string} 函数请求使用的参数表达式
 */
var getAppendRequestParamsJsdoc = function (path, paramsName, hasNoteData, project) {
    var requestParams = '';
    path.replace(pathHasParamsRegex, function (_, p1) { return requestParams += "".concat(p1, ", "); });
    requestParams = "(".concat(requestParams).concat(hasNoteData ? "".concat(paramsName, ", ") : '', "options").concat(getCustomerParamsStr(project), ")");
    return requestParams;
};
/** 首字母大写 */
var getUpperCaseName = function (name) {
    return name.replace(/^([a-zA-Z])/, function (_, item) { return item.toUpperCase(); });
};
var getCommandNote = function (keyNote, typeName) {
    if (!keyNote.length)
        return '';
    var version = global.apiConfig.version;
    var noteString = '';
    if (version === 'ts') {
        keyNote.forEach(function (item) {
            var key = item.key, type = item.type, description = item.description;
            var example = getSuitableDefault(item);
            noteString += getSuitableTsTypeNote(description, example);
            noteString += getSuitableTsType(key, type);
        });
        return getSuitableTsInterface(typeName, noteString);
    }
    if (version === 'js') {
        keyNote.forEach(function (item) {
            var key = item.key, type = item.type, description = item.description;
            var example = getSuitableDefault(item);
            noteString += getSuitableJsdocProperty(key, type, description, example);
        });
        return getSuitableJsdocType(typeName, noteString);
    }
    return '';
};
/** 处理返回的数据类型typeName */
var getType = function (type, key, typeName) {
    if (type === 'array') {
        return typeName + getUpperCaseName(key) + '[]';
    }
    if (type === 'object') {
        return typeName + getUpperCaseName(key);
    }
    return type;
};
/** 根据用户配置自定义参数去获取请求的额外参数, requestParams */
var getCustomerParamsStr = function (project, showDefault) {
    if (showDefault === void 0) { showDefault = true; }
    var customParams = project.customParams || global.apiConfig.customParams;
    if (!customParams || !customParams.length)
        return '';
    return customParams.reduce(function (pre, cur, index) {
        if (!index)
            pre += ', ';
        if (cur.name)
            pre += "".concat(cur.name);
        if (showDefault && cur.default)
            pre += " = ".concat(/\d+/.test(cur.default + '') ? cur.default : "'".concat(cur.default, "'"));
        if (index !== customParams.length - 1)
            pre += ', ';
        return pre;
    }, '');
};
/** 处理传Id的API请求URL */
var getAppendPath = function (path, project) {
    var prefix = getApiBaseUrl(project);
    var isHaveParams = pathHasParamsRegex.test(path); // 地址栏上是否有参数
    if (!isHaveParams)
        return "'".concat(prefix).concat(path, "'");
    // eslint-disable-next-line no-useless-escape
    return "`".concat(prefix).concat(path.replace(pathHasParamsRegex, function (_, p1) { return "/${".concat(p1, "}"); }), "`");
};
/** 获取用户axiosName, 可能会有ssr,或者将axios 挂载在this指针的情况  */
var getAxiosName = function () {
    var axiosName = global.apiConfig.axiosName;
    return axiosName || 'fetch';
};
var getMainRequestMethodStr = function (project, item, requestParamsStr, appendParamsStr, returnType) {
    if (appendParamsStr === void 0) { appendParamsStr = ''; }
    var requestPath = getAppendPath(item.path, project);
    var requestName = getApiName(item.path, item.method);
    var returnTypeStr = returnType ? ": Promise<".concat(returnType, ">") : '';
    var _a = global.apiConfig.outputStyle, outputStyle = _a === void 0 ? OutputStyle.Default : _a;
    var requestContent = "{\n      const method = '".concat(item.method, "'\n      return ").concat(getAxiosName(), "(").concat(requestPath, ", { ").concat(appendParamsStr, "method, ...options }").concat(getCustomerParamsStr(project, false), ")\n   }");
    switch (outputStyle) {
        case OutputStyle.Name:
            return "   export function ".concat(requestName).concat(requestParamsStr).concat(returnTypeStr, " ").concat(requestContent);
        case OutputStyle.Anonymous:
            return "   export const ".concat(requestName, " = ").concat(requestParamsStr).concat(returnTypeStr, " => ").concat(requestContent);
        default:
            return " ".concat(requestName, ": ").concat(requestParamsStr).concat(returnTypeStr, " => ").concat(requestContent, ",");
    }
};

/** 获取传参名称 */
var getNoteNameByParamsType = function (item, project, hasParamsQuery) {
    var requestName = getApiName(item.path, item.method);
    var ParamsName = getUpperCaseName(requestName);
    return ParamsName + (hasParamsQuery ? 'Params' : 'Data');
};
/** 获取放在Promise<xxx>的名字 */
var getReturnType = function (returnName, resType) {
    if (returnName === 'array')
        return '[]';
    return resType ? returnName : 'any';
};
/** 获取返回的参数名 */
var getReturnName = function (requestName, value) {
    var returnName = requestName + 'Response';
    var type = getTypeByValue(value);
    if (type === 'string' || type === 'array')
        return type; // 如果是字符串或者数组，直接返回类型作为类型名
    return returnName;
};
/** 处理一下detailMsg最外层和数组的序列对象 */
var dealResponseData = function (res) {
    var isArray = false; // 是否为数组对象
    if (hasProperty(res, 'detailMsg')) {
        res = res.detailMsg;
        if (hasProperty(res, 'items') && res.type === 'array') { // 数组的结构专门处理
            res = res.items;
            isArray = true;
        }
    }
    return { res: res, isArray: isArray };
};
/** 获取文档地址 */
var getApiLinkAddress = function (baseUrl, project_id, _id) {
    return "".concat(baseUrl, "/project/").concat(project_id, "/interface/api/").concat(_id);
};
/** 获取api最后更新时间 */
var getUpdateTime = function (time) { return new Date(time * 1000).toLocaleDateString(); };
/** 导出axios的额外参数 */
var getAxiosType = function () {
    var isNeedAxiosType = global.apiConfig.isNeedAxiosType;
    var axiosType = typeof isNeedAxiosType === 'boolean' && isNeedAxiosType ? '\n   * @param { AxiosRequestConfig } options' : '';
    return axiosType;
};
/** 获取axios 的额外的请求名称 */
var getAxiosOptionTypeName = function () {
    var isNeedAxiosType = global.apiConfig.isNeedAxiosType;
    var axiosTypeName = typeof isNeedAxiosType === 'boolean' && isNeedAxiosType ? 'AxiosRequestConfig' : 'any';
    return axiosTypeName;
};

/** 配置注释 */
var getNoteStringItem$3 = function (item) {
    var _a = global.apiConfig, protocol = _a.protocol, host = _a.host;
    var project_id = item.project_id;
    return "\n /**\n   * @description ".concat(item.title).concat(getAxiosType(), "\n   * @apiUpdateTime ").concat(new Date(item.up_time * 1000).toLocaleDateString(), "\n   * @link ").concat(protocol, "//").concat(host, "/project/").concat(project_id, "/interface/api/").concat(item._id, "\n   */");
};
/** 配置请求主方法 */
var getMainMethodItem$3 = function (item, project) {
    var paramsName = ['GET', 'DELETE'].includes(item.method.toUpperCase()) ? 'params' : 'data'; // 按照一般情况处理
    var requestParams = getAppendRequestParamsJsdoc(item.path, paramsName, true, project);
    var appendParamsStr = "".concat(paramsName, ", ");
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr);
};
var handleJsFileString = function (fileBufferStringChunk, item, project) {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem$3(item));
    fileBufferStringChunk.push(getMainMethodItem$3(item, project));
};

/** 配置注释 */
var getNoteStringItem$2 = function (item) {
    var _a = global.apiConfig, protocol = _a.protocol, host = _a.host;
    var project_id = item.project_id;
    return "\n /**\n   * @description ".concat(item.title, " \n   * @apiUpdateTime ").concat(new Date(item.up_time * 1000).toLocaleDateString(), "\n   * @link ").concat(protocol, "//").concat(host, "/project/").concat(project_id, "/interface/api/").concat(item._id, "\n   */");
};
/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据
 * @returns {string} 函数请求使用的参数表达式
 */
var getAppendRequestParamsTs = function (path, paramsName, project) {
    var requestParams = '';
    path.replace(pathHasParamsRegex, function (_, p1) { return requestParams += "".concat(p1, ": string | number, "); });
    requestParams = "(".concat(requestParams).concat("".concat(paramsName, ": any, "), "options: ").concat(getAxiosOptionTypeName()).concat(getCustomerParamsStr(project), ")");
    return requestParams;
};
/** 配置请求主方法 */
var getMainMethodItem$2 = function (item, project) {
    var paramsName = ['GET', 'DELETE'].includes(item.method.toUpperCase()) ? 'params' : 'data'; // 按照一般情况处理
    var requestParams = getAppendRequestParamsTs(item.path, paramsName, project);
    var appendParamsStr = "".concat(paramsName, ", ");
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr, 'any');
};
var handleTsFileString = function (fileBufferStringChunk, item, project) {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem$2(item));
    fileBufferStringChunk.push(getMainMethodItem$2(item, project));
};

/** 获取不正常序列化的数组对象注释 */
var getUnNormalObjectNote = function (arrayValue, typeName) {
    var arrayItem = arrayValue[0];
    var keyNote = Object.keys(arrayItem);
    var commonArr = keyNote.map(function (key) {
        var type = getSuitableType(arrayItem[key]);
        var description = String(arrayItem[key]); // 暂时只是序列了两层，超过了三层的没有处理,
        return {
            key: key,
            type: type,
            description: description,
            default: ''
        };
    });
    return getCommandNote(commonArr, typeName);
};
/** 正常的数组对象注释 */
var getNormalObjectNote = function (data, typeName) {
    var keyNote = Object.keys(data);
    var commonArr = [];
    keyNote.reduce(function (pre, key) {
        var value = data[key];
        if (!value || typeof value !== 'object')
            return pre;
        var description = value.description || '';
        var type = getSuitableType(value);
        var defaultStr = value.default || '';
        pre.push({ key: key, description: description, type: type, default: defaultStr });
        return pre;
    }, commonArr);
    var note = getCommandNote(commonArr, typeName);
    return note;
};
var getObjectTypeNote = function (objectValue, addTypeName) {
    if (hasProperty(objectValue, 'mock'))
        return '';
    if (hasProperty(objectValue, 'type') && objectValue.type === 'boolean')
        return 'boolean';
    var keys = Object.keys(objectValue);
    var commonArr = keys.map(function (key) {
        var type = getSuitableType(objectValue[key]);
        var defaultStr = getSuitableDefault(objectValue[key]);
        var description = objectValue[key].description || '';
        return { key: key, type: type, description: description, default: defaultStr };
    });
    if (!commonArr.length)
        return '';
    return getCommandNote(commonArr, addTypeName);
};
/**
 * 获取数据结构里面的数组对象，这里面有三种情况需要处理
 * 1、第一种是最外层是item的object对象，但是实际api是要传数组的
 * 2、string或者number的array对象
 * 3、没有正常序列的数组对象，object。这样的数据没有正常description字段
 * @param arrayValue 需要处理的数组对象
 * @param addTypeName 注释类型名称
 * @returns {string}
 */
var getArrayTypeNote = function (arrayValue, addTypeName) {
    if (!arrayValue.length && hasProperty(arrayValue, 'items')) { //  1、这里处理外部有一层Item
        var data = arrayValue.items;
        if (hasProperty(data, 'type') && data.type === 'string')
            return 'string';
        if (hasProperty(data, 'type') && data.type === 'integer')
            return 'number';
        if (hasProperty(data, 'type') && data.type === 'number')
            return 'number';
        if (hasProperty(data, 'ordinal') && typeof data.ordinal === 'boolean')
            return 'string'; // 后台状态字符创标志符
        var note_1 = getNormalObjectNote(data, addTypeName);
        return note_1;
    }
    var type = typeof arrayValue[0];
    if (type !== 'object')
        return type; // 2、第二种情况处理
    var note = getUnNormalObjectNote(arrayValue, addTypeName); // 3、第三种情况处理
    return note;
};
/** 处理第二层级的array和object */
var getSecondNoteAndName = function (value, addTypeName, type, appendNoteJsdocType) {
    if (type.includes('array')) {
        var typeName = addTypeName.substring(0, addTypeName.length - 2);
        var addNote = getArrayTypeNote(value, typeName);
        if (addNote === 'string' || addNote === 'number')
            type = "".concat(addNote, "[]"); // 处理字符串数组和特殊的api自动生成错误
        if (addNote.includes('@typedef')) { // 有正常序列的Jsdoc
            type = addTypeName;
            if ('string, boolean, number'.includes(addNote))
                type = "".concat(addNote, "[]");
            appendNoteJsdocType += addNote;
        }
        if (addNote.includes('interface')) { // 有正常序列的TsType
            type = addTypeName;
            if ('string, boolean, number'.includes(addNote))
                type = "".concat(addNote, "[]");
            appendNoteJsdocType += addNote;
        }
    }
    if (type.includes('object')) {
        var addNote = getObjectTypeNote(value, addTypeName);
        if (addNote.startsWith('/**')) {
            appendNoteJsdocType = addNote;
            type = addTypeName;
        }
        if (addNote === 'boolean' || addNote === 'number') {
            appendNoteJsdocType = '';
            type = addNote;
        }
    }
    return { note: appendNoteJsdocType, name: type };
};

/** 配置返回注释 */
var getReturnNoteStringItem$1 = function (item) {
    var body = getLegalJson(item.res_body); // 获取合法的json数据
    if (typeof body !== 'object')
        return { returnNameWithType: 'string', resType: '' };
    var requestName = getApiName(item.path, item.method);
    var data = removeProperties(body); // 删除后台传回来的多余嵌套的属性数据
    var _a = dealResponseData(data), res = _a.res, isArray = _a.isArray; // 处理一下返回的数据
    var returnName = getReturnName(requestName, res);
    var resType = dealJsonToJsDocReturn(res, returnName);
    var returnNameWithType = isArray ? "".concat(returnName, "[]") : returnName;
    return { returnNameWithType: returnNameWithType, resType: resType };
};
/** 处理返回的数据类型处理 */
var dealJsonToJsDocReturn = function (data, returnName) {
    var bodyStr = '';
    var appendNoteJsdocType = ''; // 额外的JsDocType
    if (!Object.keys(data).length)
        return ''; // 空的对象不做处理，提高性能
    if (returnName === 'string' || returnName === 'array')
        return '';
    Object.entries(data).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var description = getSuitDescription(value);
        var type = getSuitableType(value);
        // 处理二层的Type类型
        var addTypeName = getType(type, key, returnName);
        var _b = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType), note = _b.note, name = _b.name;
        appendNoteJsdocType = note;
        if (name !== type)
            type = name;
        bodyStr += getSuitableJsdocProperty(key, type, description);
    });
    return getSuitableJsdocType(returnName, bodyStr, appendNoteJsdocType);
};

/** 获取请求参数（params）传输参数，考虑到params一律是传地址栏，所以type默认设置为string */
var getConfigNoteParams$1 = function (reqQuery, requestName) {
    var paramsStr = '';
    reqQuery.forEach(function (item) {
        var example = getSuitableDefault(item);
        paramsStr += getSuitableJsdocProperty(item.name, 'string', item.desc, example);
    });
    if (!paramsStr)
        return '';
    return getSuitableJsdocType(requestName, paramsStr);
};
/** 处理请求体(data)的逻辑规则 */
var getJsonToJsDocParams$1 = function (json, requestName) {
    var bodyStr = '';
    var appendNoteJsdocType = ''; // 额外的JsDocType
    var properties = removeProperties(json);
    if (!Object.keys(properties).length)
        return ''; // 空的对象不做处理，提高性能
    Object.entries(properties).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var description = getSuitDescription(value);
        var type = getSuitableType(value);
        var addTypeName = getType(type, key, requestName); // 这里处理额外的类型
        var _b = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType), note = _b.note, name = _b.name;
        appendNoteJsdocType = note;
        if (name !== type)
            type = name;
        var example = getSuitableDefault(value);
        bodyStr += getSuitableJsdocProperty(key, type, description, example);
    });
    return getSuitableJsdocType(requestName, bodyStr, appendNoteJsdocType);
};
/** 获取注释的jsDoc类型 */
var getReqType$1 = function (item, typeName, hasParamsQuery) {
    if (hasParamsQuery) {
        return getConfigNoteParams$1(item.req_query, typeName);
    }
    else {
        var body = getLegalJson(item.req_body_other); // 获取合法的json数据
        return getJsonToJsDocParams$1(body, typeName);
    }
};
/** 获取请求的参数注释和参数名 */
var getRequestNoteStringItem$1 = function (item, project) {
    var hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length);
    var typeName = getNoteNameByParamsType(item, project, hasParamsQuery); // 正常object使用的名字
    var reqType = getReqType$1(item, typeName, hasParamsQuery);
    return { reqType: reqType, typeName: typeName };
};

/** 配置地址栏上面的id jsdoc 注释 */
var getAppendIdNote = function (params) {
    return params.reduce(function (pre, curr) {
        var example = curr.example, desc = curr.desc, name = curr.name, _id = curr._id;
        if (_id)
            pre += "\n   * @param { number | string } ".concat(name, " ").concat(desc, "  example: ").concat(example, " ");
        return pre;
    }, '');
};
/** 获取请求注释上的param注释字符串 */
var getNoteParams = function (reqType, typeName, hasParamsQuery) {
    if (!typeName.includes('[]') && !reqType)
        return '';
    return "\n   * @param { ".concat(typeName, " } ").concat(hasParamsQuery ? 'params' : 'data');
};
/** 配置请求注释 */
var getNoteStringItem$1 = function (item, project) {
    var hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length);
    var _a = getRequestNoteStringItem$1(item, project), reqType = _a.reqType, typeName = _a.typeName;
    var _b = getReturnNoteStringItem$1(item), resType = _b.resType, returnNameWithType = _b.returnNameWithType;
    var idNote = getAppendIdNote(item.req_params);
    var methodNote = "\n  /**\n   * @description ".concat(item.title).concat(idNote).concat(getNoteParams(reqType, typeName, hasParamsQuery)).concat(getAxiosType(), "\n   * @apiUpdateTime ").concat(getUpdateTime(item.up_time), "\n   * @link ").concat(getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id), "\n   * @return { Promise<").concat(getReturnType(returnNameWithType, resType), "> }\n   */");
    return { methodNote: methodNote, typeName: typeName, reqType: reqType, resType: resType };
};
/** 配置请求主方法 */
var getMainMethodItem$1 = function (item, hasNoteData, project) {
    var hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length);
    var paramsName = hasParamsQuery ? 'params' : 'data';
    var requestParams = getAppendRequestParamsJsdoc(item.path, paramsName, hasNoteData, project);
    var appendParamsStr = hasNoteData ? "".concat(paramsName, ", ") : '';
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr);
};
var handleJsdocFileString = function (fileBufferStringChunk, item, project, noteStringChunk) {
    var _a = getNoteStringItem$1(item, project), methodNote = _a.methodNote, reqType = _a.reqType, resType = _a.resType;
    var hasNoteData = Boolean(reqType);
    var methodStr = getMainMethodItem$1(item, hasNoteData, project);
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(methodNote);
    fileBufferStringChunk.push(methodStr);
    if (reqType)
        noteStringChunk.push(reqType);
    if (resType)
        noteStringChunk.push(resType);
};

/** 配置返回注释 */
var getReturnNoteStringItem = function (item) {
    var body = getLegalJson(item.res_body); // 获取合法的json数据
    if (typeof body !== 'object')
        return { returnNameWithType: 'string', resType: '' };
    var requestName = getApiName(item.path, item.method);
    var data = removeProperties(body); // 删除后台传回来的多余嵌套的属性数据
    var _a = dealResponseData(data), res = _a.res, isArray = _a.isArray; // 处理一下返回的数据
    var returnName = getReturnName(requestName, res);
    var resType = dealJsonToTsTypeReturn(res, returnName);
    var returnNameWithType = isArray ? "".concat(returnName, "[]") : returnName;
    return { returnNameWithType: returnNameWithType, resType: resType };
};
/** chu */
/** 处理返回的数据类型处理 */
var dealJsonToTsTypeReturn = function (data, returnName) {
    var bodyStr = '';
    var appendNoteJsdocType = ''; // 额外的JsDocType
    if (!Object.keys(data).length)
        return ''; // 空的对象不做处理，提高性能
    if (returnName === 'string' || returnName === 'array')
        return '';
    Object.entries(data).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var description = getSuitDescription(value);
        var type = getSuitableType(value);
        var addTypeName = getType(type, key, returnName);
        var _b = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType), note = _b.note, name = _b.name;
        if (note)
            appendNoteJsdocType = note;
        if (name !== type)
            type = name;
        bodyStr += getSuitableTsTypeNote(description);
        bodyStr += getSuitableTsType(key, type);
    });
    var resType = getSuitableTsInterface(returnName, bodyStr, appendNoteJsdocType);
    return resType;
};

/** 获取请求参数（query）传输参数，考虑到query一律是传地址栏，所以type默认设置为string */
var getConfigNoteParams = function (reqQuery, requestName) {
    var paramsStr = '';
    reqQuery.forEach(function (item) {
        var example = getSuitableDefault(item);
        paramsStr += getSuitableTsTypeNote(item.desc, example);
        paramsStr += getSuitableTsType(item.name, 'string');
    });
    if (!paramsStr)
        return '';
    return getSuitableTsInterface(requestName, paramsStr);
};
/** 处理请求体(data)的逻辑规则 */
var getJsonToJsDocParams = function (json, requestName) {
    var bodyStr = '';
    var appendNoteJsdocType = ''; // 额外的JsDocType
    var properties = removeProperties(json);
    if (!Object.keys(properties).length)
        return ''; // 空的对象不做处理，提高性能
    Object.entries(properties).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var description = getSuitDescription(value);
        var type = getSuitableType(value);
        var addTypeName = getType(type, key, requestName); // 这里处理额外的类型
        var _b = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType), note = _b.note, name = _b.name;
        appendNoteJsdocType = note;
        if (name !== type)
            type = name;
        var example = getSuitableDefault(value);
        bodyStr += getSuitableTsTypeNote(description, example);
        bodyStr += getSuitableTsType(key, type);
    });
    return getSuitableTsInterface(requestName, bodyStr, appendNoteJsdocType);
};
/** 获取注释的jsDoc类型 */
var getReqType = function (item, typeName, hasParamsQuery) {
    if (hasParamsQuery) {
        return getConfigNoteParams(item.req_query, typeName);
    }
    else {
        var body = getLegalJson(item.req_body_other); // 获取合法的json数据
        return getJsonToJsDocParams(body, typeName);
    }
};
/** 获取请求的参数注释和参数名 */
var getRequestNoteStringItem = function (item, project) {
    var hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length);
    var typeName = getNoteNameByParamsType(item, project, hasParamsQuery); // 正常object使用的名字
    var reqType = getReqType(item, typeName, hasParamsQuery);
    return { reqType: reqType, typeName: typeName };
};

/** 获取请求上参数ts 类型名称 */
var getParamsTypeName = function (reqType, typeName) {
    if (!typeName.includes('[]') && !reqType)
        return 'any';
    else
        return typeName;
};
/** 配置请求注释 */
var getNoteStringItem = function (item) {
    return "\n  /**\n   * @description ".concat(item.title, "\n   * @apiUpdateTime ").concat(getUpdateTime(item.up_time), "\n   * @link ").concat(getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id), "\n   */");
};
/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据，Get请求使用params, Post, Put, Delete 请求使用data
 * @returns {string} 函数请求使用的参数表达式
 */
var getAppendRequestParamsTsType = function (path, paramsName, hasNoteData, requestParamsType, project) {
    var requestParams = '';
    path.replace(pathHasParamsRegex, function (_, p1) { return requestParams += "".concat(p1, ": string | number, "); });
    requestParams = "(".concat(requestParams).concat(hasNoteData ? "".concat(paramsName, "?: ").concat(requestParamsType, ", ") : '', "options?: ").concat(getAxiosOptionTypeName()).concat(getCustomerParamsStr(project), ")");
    return requestParams;
};
/** 配置请求主方法 */
var getMainMethodItem = function (item, hasNoteData, project, requestParamsType, returnParamsType) {
    var hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length);
    var paramsName = hasParamsQuery ? 'params' : 'data';
    var requestParams = getAppendRequestParamsTsType(item.path, paramsName, hasNoteData, requestParamsType, project);
    var appendParamsStr = hasNoteData ? "".concat(paramsName, ", ") : '';
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr, returnParamsType);
};
var handleTsTypeFileString = function (fileBufferStringChunk, item, project, noteStringChunk) {
    var _a = getRequestNoteStringItem(item, project), reqType = _a.reqType, typeName = _a.typeName;
    var _b = getReturnNoteStringItem(item), resType = _b.resType, returnNameWithType = _b.returnNameWithType;
    var methodNote = getNoteStringItem(item);
    var requestParamsType = getParamsTypeName(reqType, typeName);
    var returnParamsType = getReturnType(returnNameWithType, resType);
    var hasNoteData = Boolean(reqType);
    var methodStr = getMainMethodItem(item, hasNoteData, project, requestParamsType, returnParamsType);
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(methodNote);
    fileBufferStringChunk.push(methodStr);
    if (reqType)
        noteStringChunk.push(reqType);
    if (resType)
        noteStringChunk.push(resType);
};

/** 设置api文件头部文件 */
var getHeaderInfo = function () {
    var config = global.apiConfig;
    var axiosFrom = Object.prototype.hasOwnProperty.call(config, 'axiosFrom') ? config.axiosFrom : 'import fetch from \'axios\'';
    var tsHeader = config.version === 'ts' ? '\n// @ts-nocheck' : '';
    var axiosType = getTsHeaderAxiosType(config);
    return "\n/* eslint-disable */".concat(tsHeader, "\n/**\n * @file \u8BE5\u6587\u4EF6\u7531aomi-yapi-convert\u81EA\u52A8\u751F\u6210\uFF0C\u8BF7\u4E0D\u8981\u6539\u52A8\u8FD9\u4E2A\u6587\u4EF6\u3002\n * @docUpdateTime ").concat(new Date().toLocaleDateString(), "\n */\n\n").concat(axiosType).concat(axiosFrom, "\n    ");
};
/** ts文件顶部配置通用的axios config Type */
var getTsHeaderAxiosType = function (config) {
    if (config.version !== 'ts' || !config.isNeedAxiosType)
        return '';
    return 'import type { AxiosRequestConfig } from \'aomi-yapi-convert\'\n';
};
/** js文件底部配置通用的axios config jsdoc Type */
var getJsFootAxiosType = function () {
    var version = global.apiConfig.version;
    var isNeedAxiosType = global.apiConfig.isNeedAxiosType;
    if (!isNeedAxiosType || version !== 'js')
        return '';
    return "/**\n  * @typedef { import(\"aomi-yapi-convert\").AxiosRequestConfig } AxiosRequestConfig\n  */";
};
/** api文件导出类型 */
var OutputStyle;
(function (OutputStyle) {
    /** 默认导出 */
    OutputStyle["Default"] = "defaultExport";
    /** 具名导出 */
    OutputStyle["Name"] = "nameExport";
    /** 匿名导出 */
    OutputStyle["Anonymous"] = "anonymous";
})(OutputStyle || (OutputStyle = {}));
/** 配置文件头部 */
var configFileHead = function () {
    var fileBufferStringChunk = [];
    fileBufferStringChunk.push(getHeaderInfo());
    var _a = global.apiConfig.outputStyle, outputStyle = _a === void 0 ? OutputStyle.Default : _a;
    if (outputStyle !== OutputStyle.Default)
        return fileBufferStringChunk;
    fileBufferStringChunk.push('export default {');
    return fileBufferStringChunk;
};
/** 配置文件尾部 */
var configFileFoot = function (fileBufferStringChunk, noteStringChunk) {
    var _a = global.apiConfig.outputStyle, outputStyle = _a === void 0 ? OutputStyle.Default : _a;
    if (outputStyle === OutputStyle.Default)
        fileBufferStringChunk.push('}');
    fileBufferStringChunk.push.apply(fileBufferStringChunk, noteStringChunk);
    if (getJsFootAxiosType())
        fileBufferStringChunk.push(getJsFootAxiosType());
    return format(fileBufferStringChunk);
};
/** 获取文件存储的路径 */
var getSavePath = function (recommendName, project, fileConfig, nameChunk) {
    var fileName = recommendName;
    var dir = project.outputDir;
    // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
    if (fileConfig && hasProperty(fileConfig, 'fileName') && fileConfig.fileName)
        fileName = fileConfig.fileName;
    if (fileConfig && hasProperty(fileConfig, 'outputDir') && fileConfig.outputDir)
        dir = fileConfig.outputDir;
    var FileNameTimes = nameChunk.get(recommendName);
    if (FileNameTimes)
        FileNameTimes++; // 如果map已经有值那我们就+1，防止用户命名冲突，虽然不太优雅
    var version = global.apiConfig.version;
    var path = "".concat(dir, "/").concat(fileName).concat(FileNameTimes || '', ".").concat(version);
    nameChunk.set(fileName, FileNameTimes || 1);
    return path;
};
/** 根据文件类型获取生成简介版本的方法名 */
var generateSimpleBufferStringByVersion = function (version) {
    var configFunctionName = version === 'ts' ? handleTsFileString : handleJsFileString;
    return configFunctionName;
};
/** 根据文件类型获取生成智能提示版本的方法名 */
var generateTypeBufferStringByVersion = function (version) {
    var configFunctionName = version === 'ts' ? handleTsTypeFileString : handleJsdocFileString;
    return configFunctionName;
};
var getFileName = function (path, fileNameSet) {
    path = path.replace(/\/{.+}/g, '');
    path = path.substring(1, path.length);
    var words = path.split('/');
    words.forEach(function (word) {
        word = toHumpName(word);
        word = word.replace(/^([A-Z])/, function (_, item) { return item.toLowerCase(); }); // 转下首字母小写
        fileNameSet[word] ? fileNameSet[word]++ : fileNameSet[word] = 1;
    });
};
/** 获取合法可以被处理的接口path，有些接口可能不是很常规，这里处理异常情况 */
var getValidApiPath = function (path) {
    if (path.includes('?'))
        path = path.split('?')[0];
    if (path.endsWith('/'))
        path = path.slice(0, path.length - 1);
    return path;
};
/** 获取还没有命名过并且出现次数最多的词作为文件夹名 */
var getMaxTimesObjectKeyName = function (obj, hasSaveNames) {
    var sortKeyByTimes = Object.keys(obj).sort(function (key1, key2) { return obj[key2] - obj[key1]; });
    var uinFileName = sortKeyByTimes.find(function (key) { return !hasSaveNames.includes(key); }) || 'common';
    return uinFileName;
};
/**
 * 获取Js文件的单个API文件写入的文件流字符串和注释类型
 * @param item 接口菜单单项
 * @param project 项目组文件的配置
 * @returns {Object}
 */
var getApiFileConfig = function (item, project) {
    var list = item.list;
    var isNeedType = global.apiConfig.isNeedType;
    var fileBufferStringChunk = configFileHead(); // 单个API文件流
    var noteStringChunk = ['\n']; // 存储Jsdoc注释的容器
    list.forEach(function (item) {
        if (project.hideUnDoneApi && item.status === 'undone')
            return;
        item.path = getValidApiPath(item.path); // 处理一些后台在地址栏上加参数的问题
        if (isNeedType) {
            generateTypeBufferStringByVersion(global.apiConfig.version)(fileBufferStringChunk, item, project, noteStringChunk);
        }
        else {
            generateSimpleBufferStringByVersion(global.apiConfig.version)(fileBufferStringChunk, item, project);
        }
    });
    return { fileBufferStringChunk: fileBufferStringChunk, noteStringChunk: noteStringChunk };
};
/**
 * 生成一个文件的文件流
 * @param item 单个菜单对象
 * @param project 用户配置项目对象，详见readme.md或者type文件
 * @returns 单个文件字符流
 */
var generatorFileCode = function (item, project) {
    var _a = getApiFileConfig(item, project), fileBufferStringChunk = _a.fileBufferStringChunk, noteStringChunk = _a.noteStringChunk;
    if (!fileBufferStringChunk.length)
        return '';
    var saveFileBuffer = configFileFoot(fileBufferStringChunk, noteStringChunk);
    return saveFileBuffer;
};
/**
 * 获取文件名称
 * @param item 接口菜单项
 * @param hasSaveNames 已经取名的容器
 * @returns 文件名称
 */
var getApiFileName = function (item, hasSaveNames) {
    var list = item.list;
    var fileNameSet = {};
    list.forEach(function (api) {
        getFileName(api.path, fileNameSet);
    });
    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法
    var FileName = getMaxTimesObjectKeyName(fileNameSet, hasSaveNames);
    hasSaveNames.push(FileName);
    return FileName;
};

var request = function (url, method) {
    if (method === void 0) { method = 'post'; }
    return new Promise(function (resolve) {
        var http = new XMLHttpRequest();
        http.open(method, url, true);
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                resolve(http.responseText);
            }
        };
        var headerBody = JSON.stringify(getHeader());
        http.send(headerBody);
    });
};
var handleApiRequestError = function (error) {
    if (error.includes('40011')) {
        console.log('\n\x1b[33m', 'token 已经过期， 请从yapi文档获取最新token');
    }
    else {
        console.log(error);
    }
};

/**
 * 注册全局变量，node环境注册global里面的对象，browser环境注册global 到window对象
 * @param config 配置项
 */
var registerGlobal = function (config) {
    window.global = { apiConfig: config }; // 浏览器注册全局变量
};
/** 主流程：获取项目配置 => 获取接口json => 生成接口文档 */
var index = (function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var protocol, host, projects, baseUrl;
    return __generator(this, function (_a) {
        registerGlobal(config);
        protocol = config.protocol, host = config.host, projects = config.projects;
        baseUrl = "".concat(protocol, "//").concat(host);
        projects.forEach(function (project) {
            var projectId = project.projectId;
            var projectConfigUrl = "".concat(baseUrl, "/api/project/get?id=").concat(projectId);
            request(projectConfigUrl)
                .then(function (projectConfigStr) {
                var projectConfig = JSON.parse(projectConfigStr);
                project.projectBaseConfig = projectConfig.data;
                project.requestUrl = "".concat(baseUrl, "/api/plugin/export?type=json&pid=").concat(projectId, "&status=all&isWiki=false"); // jsonUrl
                return request(project.requestUrl);
            })
                .then(function (fileString) {
                var commonJson = JSON.parse(fileString);
                generatorFileList(commonJson, project);
            })
                .catch(function (error) {
                handleApiRequestError(String(error));
            });
        });
        return [2 /*return*/];
    });
}); });
/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
var generatorFileList = function (data, project) {
    var nameChunk = new Map(); // 用来处理文件命名的容器
    var group = project.group, isLoadFullApi = project.isLoadFullApi;
    var hasSaveNames = []; // 处理已经命名的容器
    data.forEach(function (item) {
        if (!item.list.length)
            return;
        var fileConfig = group === null || group === void 0 ? void 0 : group.find(function (menu) { return menu.catId == item.list[0].catid; });
        if (!isLoadFullApi && !fileConfig)
            return;
        var saveFileBuffer = generatorFileCode(item, project);
        if (!saveFileBuffer)
            return;
        var FileName = getApiFileName(item, hasSaveNames);
        var savePath = getSavePath(FileName, project, fileConfig, nameChunk);
        console.log(savePath, saveFileBuffer);
    });
};

export { index as default, generatorFileCode, generatorFileList, getApiFileName, getSavePath };
