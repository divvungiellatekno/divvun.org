<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     xmlns:dir="http://apache.org/cocoon/directory/2.0"
     exclude-result-prefixes="dir" >

  <!--  Template to extract the document language, if available -->
  <xsl:template match="dir:directory">
    <fallback found="{count(dir:file)}">
      <xsl:apply-templates/>
    </fallback>
  </xsl:template>

  <xsl:template match="dir:file">
    <xsl:choose>
      <xsl:when test="dir:xpath//@xml:lang">
        <xsl:choose>
          <xsl:when test="string-length(dir:xpath//@xml:lang[1]) = 3">
            <xsl:if test="dir:xpath//@xml:lang[1] = 'sme'">se</xsl:if>
            <xsl:if test="dir:xpath//@xml:lang[1] = 'nob'">nb</xsl:if>
            <xsl:if test="dir:xpath//@xml:lang[1] = 'nno'">nn</xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="dir:xpath//@xml:lang[1]"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="dir:xpath//@lang[1]">
        <xsl:choose>
          <xsl:when test="string-length(dir:xpath//@lang[1]) = 3">
            <xsl:if test="dir:xpath//@lang[1] = 'sme'">se</xsl:if>
            <xsl:if test="dir:xpath//@lang[1] = 'nob'">nb</xsl:if>
            <xsl:if test="dir:xpath//@lang[1] = 'nno'">nn</xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="dir:xpath//@lang[1]"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
