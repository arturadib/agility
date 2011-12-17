VER = `cat VERSION` # (`date '+%b %d, %Y'`)

all:
	@echo "Nothing to do (prevents unintended dist update)"
	@echo
	@exit

dist:
	@echo "Making distribution version $(VER)..."

	@echo "Minifying to agility.min.js"...
	@cat LICENSE_HEADER > agility.min.js
	@jsmin < ../agility.js >> agility.min.js

	@echo "Creating agility-start.zip"...
	@cp -f agility.min.js agility-start/
	@zip agility-start.zip agility-start/*

docs:
	@echo "Making docs for version $(VER)..."

	@markdown_py -x codehilite _index.md > index-content.html
	@sed -E -i.bak "s/__VERSION__/$(VER)/" index-content.html
	@sed '/__INSERT_POINT__/ r index-content.html' _index.html > index.html

	@markdown_py -x codehilite _docs.md > docs-content.html
	@sed -E -i.bak "s/__VERSION__/$(VER)/" docs-content.html
	@sed '/__INSERT_POINT__/ r docs-content.html' _docs.html > docs.html

	@markdown_py -x codehilite _gallery.md > gallery-content.html
	@sed -E -i.bak "s/__VERSION__/$(VER)/" gallery-content.html
	@sed '/__INSERT_POINT__/ r gallery-content.html' _gallery.html > gallery.html

	@rm -f *-content.html *.bak
	@mv -f index.html ..
