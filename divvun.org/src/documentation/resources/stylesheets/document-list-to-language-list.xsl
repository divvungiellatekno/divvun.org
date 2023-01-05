<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     xmlns:dir="http://apache.org/cocoon/directory/2.0"
     exclude-result-prefixes="dir" >

  <!--  Template to generate the document language -->
  <xsl:template match="dir:directory">
    <localised found="{count(dir:file)}">
      <xsl:apply-templates/>
    </localised>
  </xsl:template>

  <xsl:template match="dir:file">
    <locale>
      <xsl:value-of select="substring-before(substring-after(@name,'.'),'.')"/>
    </locale>
  </xsl:template>

</xsl:stylesheet>
