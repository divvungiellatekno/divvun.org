Filnamn-konvensjon for brukardokumenta
======================================

Tekstfiler (xml eller jspwiki)
______________________________

Filnamnet skal innehalda komponentar for:
- plattform
- dokumentkategori (installering, bruk, tastaturoppsett osb.)
- vertsprogram
- vertsprogramversjon
- OS-versjon
- Divvun-spåk (ISO-3-kode)
- OS-språk (ISO-3-kode)
- dokumentasjonsspråk (ISO-2-kode)

Ikkje alle komponentane er relevante for alle dokument, dei som ikkje trengst
blir berre hoppa over.

Komponentane er organisert slik:

plattform/dokumentkategori-vertsprogram-vertsprogramversjon-OS_versjon-Divvun_språk-OS_språk.dokumentasjonsspråk.filtypesuffiks

Kvar kategori som ikkje er ein katalog eller suffiks, er skilt frå andre
kategoriar med bindestrek. Dersom ein kategori treng fleire ord, er desse
lenka i hop med golvstrek.

Døme:

mac/install-msoff-2011.no.xml
mac/enable_keyboard-osx10.8.no.xml
win/enable_smj_input-win7.no.xml

Biletfiler (png eller jpeg)
___________________________

Dei fylgjer same mønsteret som for tekstfilene, med eitt unnatak: dokumentasjonsspråket er ikkje koda. I staden kjem det ein språkkode for OS-språk, slik at ein ser kva for OS-språk som er illustrert i biletet.

Døme:

mac/images/installation-dmg_open-msoff-2011-nob.png
win/images/legg_til_inndatasprak_sma-win7-nob.png
