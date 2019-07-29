# @suddenly-api

A helper for making API calls.

## Usage

```js
import API from '@suddenly/api';

const api = new API('app-name', '/api');

api.setSessionToken('SOME SIGNED JWT TOKEN TO AUTH WITH YOUR SERVER');

api.get('/things').then(things => {
  console.log(things);
});

api.post('/things', { name: 'New Thing' }).then(thing => {
  console.log(thing);
});

api.put('/things/1', { name: 'Updated Thing' }).then(thing => {
  console.log(thing);
});

api.delete('/things/1').then(thing => {
  console.log(thing);
});
```

## Contributors

- Nathan Hoad - [nathan@nathanhoad.net]
