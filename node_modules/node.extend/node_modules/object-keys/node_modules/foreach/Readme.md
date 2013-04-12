
# foreach

Iterate over the key value pairs of either an array-like object or a dictionary like object.

## API

### foreach(object, function, [context])

```js
var each = require('foreach');

each([1,2,3], function (value, key) {
    // value === 1, 2, 3
    // key === 0, 1, 2
});

each({0:1,1:2,2:3}, function (value, key) {
    // value === 1, 2, 3
    // key === 0, 1, 2
});
```


