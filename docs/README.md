# Agility docs

## Contributing

You should only have to modify Markdown files (e.g. `_docs.md`, `_index.md`, etc).

## Building

Dependencies:

+ Python Markdown http://freewisdom.org/projects/python-markdown/
+ Pygments + CodeHilite http://freewisdom.org/projects/python-markdown/CodeHilite
+ JSMin http://www.crockford.com/javascript/jsmin.html

On Mac OS X, you can do an `$ easy_install pip`, then:

+ `$ pip install markdown pygments` (sudo)
+ `$ brew install jsmin`

Then do a `$ make docs`. This should generate all the necessary production files (`index.html`, etc).
