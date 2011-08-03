# Agility.js
 
http://agilityjs.com

Agility is an MVC library for browser-side Javascript that lets you write **maintainable** code without compromising on **development speed**. It's [write less, do more](http://www.jquery.com) with maintainability. 

Features include:

+ Painless two-way model-view bindings;
+ Implicit controller-event bindings;
+ Controller auto-proxying for quick and consistent access to owner object;
+ Format and style in-object for "copy-and-paste" reusability;
+ Small (<10K) single-library include;
+ Compact and efficient syntax, inspired by jQuery;
+ Pure prototypal inheritance;
+ Strict MVC: core has no additional concepts other than M, V, and C.


## Agility 2.0: My plans in this branch

For my own project, I want Agility.js to have templating and model bindings, and with discussion with arturadib, I have decided to work on a new archetecture for templating.

These contributions will add these additional features:

+ Templates with speedy rerendering (does not recreate HTML);
+ Inclusion of other "components" inside the format;
+ Flexible binding mechanism (text & multiple fields in the same attribute or tag);
+ External models;
+ Model binding;
+ Full backwords compatibility;

How do I plan to do this? Well, it's simple:

1. Move the model methods into their own class and extend with .bind() & .prop() methods. Agility objects will observe their models (which would be a feature not a necessity with additional contributions).
2. Reimplement bindings to be instances of the model class.
3. Implement a templating system to wrap the new binding system.

This results in the following architecture:
+ A seperate model composite observer system which directs changes to the roots' callbacks.
  * Translates to change events.
  * Repopulates sections with changed content.
+ Templates provide easy access to the extended binding system.