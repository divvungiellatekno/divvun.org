<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     xmlns:i18n="http://apache.org/cocoon/i18n/2.1">

  <xsl:param name="matched-locale"/>
  <xsl:param name="fallback-locale"/>

  <!--  Template to extract the document language, if available -->
  <xsl:template match="document">
    <document localecount="{fallback/@found + localised/@found}">
      <xsl:apply-templates/>
    </document>
  </xsl:template>

  <xsl:template match="locale">
    <xsl:if test="../@found &gt; 0">
      <locale>
        <xsl:attribute name="value">
          <xsl:value-of select="./text()"/>
        </xsl:attribute>
        <xsl:attribute name="url">
          <xsl:value-of select="concat('?locale=', ./text() )"/>
        </xsl:attribute>
        <xsl:if test="./text() = $matched-locale">
          <xsl:attribute name="selected">true</xsl:attribute>
        </xsl:if>
        <text><i18n:text><xsl:apply-templates/></i18n:text></text>
        <title>
          <i18n:text catalogue="languages">
            <xsl:apply-templates/>
          </i18n:text>
        </title>
      </locale>
    </xsl:if>
  </xsl:template>

  <xsl:template match="fallback">
    <xsl:if test="@found = 1">
      <locale fallback="true">
        <xsl:attribute name="value">
          <xsl:value-of select="./text()"/>
        </xsl:attribute>
        <xsl:attribute name="url">
          <xsl:value-of select="concat('?locale=', ./text() )"/>
        </xsl:attribute>
        <xsl:if test="./text() = $matched-locale">
          <xsl:attribute name="selected">true</xsl:attribute>
        </xsl:if>
        <text><i18n:text><xsl:apply-templates/></i18n:text></text>
        <title>
          <i18n:text catalogue="languages">
            <xsl:apply-templates/>
          </i18n:text>
        </title>
      </locale>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
