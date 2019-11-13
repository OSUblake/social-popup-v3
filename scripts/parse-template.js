const escape = string => string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");

module.exports = (template, tags = ["$_", "_$"], missingHelper) => {
  
  const split = `${tags[0]}a${tags[1]}`
  const group = `(\\w+(?:\\.\\w+)*)`;
  const regex = new RegExp(`${escape(tags[0])}${group}${escape(tags[1])}`, "g");
  const paths = [];
  const keys = [];
    
  const strings = template.replace(regex, (match, group) => {
    keys.push(match);
    paths.push(group.split("."));
    return split;
  }).split(split);

  const result = strings.reduce((res, str, i) => {
    res.push(str, keys[i]);
    return res;
  }, []);

  return (data) => {
        
    for (let i = 0, j = 1; i < keys.length; i++, j += 2) {
            
      let key = keys[i];
      let path = paths[i];          
      let last = path.length - 1;
      let scope = data;
      let value = key;
            
      for (let k = 0; k < last; k++) {
        let prop = path[k];
        scope = scope && scope[prop] ? scope[prop] : null;
      }
      
      if (scope) {

        value = scope[path[last]];

        if (typeof value === "function") {
          value = value.call(scope);
        }
      } else {
        value = missingHelper ? missingHelper(path.join("."), data) : key;  
      }

      result[j] = value;      
    }
    
    return result.join("");
  };
}
