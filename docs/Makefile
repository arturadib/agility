VER = `cat VERSION` (`date '+%b %d, %Y'`)

all:
	@echo "Making version $(VER)..."

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

	@echo "Minifying"...
	@cat LICENSE_HEADER > agility.min.js
	@jsmin < ../agility.js >> agility.min.js
