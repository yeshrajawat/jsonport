self.onmessage = function (event) {
    const jsonText = event.data;
  
    try {
      const parsed = JSON.parse(jsonText);
  
      const buildIndex = (obj, path = "", index = {}) => {
        if (typeof obj === "object" && obj !== null) {
          for (const key in obj) {
            const newPath = path ? `${path}.${key}` : key;
            const value = obj[key];
  
            if (typeof value !== "object") {
              const keyValue = String(value).toLowerCase();
  
              if (!index[keyValue]) {
                index[keyValue] = [];
              }
  
              index[keyValue].push(newPath);
            }
  
            buildIndex(value, newPath, index);
          }
        }
  
        return index;
      };
  
      const index = buildIndex(parsed);
  
      self.postMessage({
        json: parsed,
        index: index
      });
  
    } catch (error) {
      self.postMessage({
        error: "Invalid JSON"
      });
    }
  };