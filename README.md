Nothing here yet.

# Anti-patterns:

## Overriding functions post-building

    var obj = $$();
    obj.view.format = '...etc...';
    
Use instead:

    var obj = $$({
      view: {
        format: '...etc...'
      }
    });

This ensures proper initializations, bindings, etc.
