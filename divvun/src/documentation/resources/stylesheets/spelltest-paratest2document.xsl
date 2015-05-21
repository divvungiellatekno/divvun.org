<?xml version="1.0" encoding="UTF-8"?>
<!--+
    | Transforms corpus content documents to Forrest documents according
    | to the language parameter - only content for the given language is
    | returned.
    +-->

<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:i18n="http://apache.org/cocoon/i18n/2.1"
  version="1.0">

  <xsl:param name="testlang"/>
  <xsl:param name="testtype"/>

  <xsl:key name="bugid" match="word" use="./bug"/>

  <xsl:template match="spelltestresult">
    <document>
      <header>
        <title>Speller Test Results for:
          «<xsl:value-of select="header/document"/>»
        </title>
      </header>
      <body>
        <xsl:apply-templates />
      </body>
    </document>
  </xsl:template>

  <xsl:template match="header">
    <section>
      <title>Overview</title>
      <section>
        <title>Technical data</title>
        <p>Language tested:
          <strong><xsl:value-of select="$testlang"/></strong>
        </p>
        <p>Document tested: 
          <strong><xsl:value-of select="document"/></strong>
        </p>
        <p>Speller tool:
          <xsl:choose>
            <xsl:when test="tool/@type = 'pl'">
              <strong>Polderland command line tool</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'mw'">
              <strong>AppleScript driving MS Word</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'hu'">
              <strong>Hunspell command line tool</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'vk'">
              <strong>Voikko command line tool</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'fo'">
              <strong>Foma+Trie/Kukkuniiat, command line version</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'pk'">
              <strong>Púki, command line tool</strong>
            </xsl:when>
            <xsl:otherwise>Unknown</xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Speller tool version:
          <xsl:choose>
            <xsl:when test="tool/@toolversion = ''">Unknown</xsl:when>
            <xsl:otherwise>
              <strong><xsl:value-of select="tool/@toolversion"/></strong>
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Speller lexicon version:
          <xsl:choose>
            <xsl:when test="tool/@version = ''">Unknown</xsl:when>
            <xsl:otherwise>
              <strong><xsl:value-of select="tool/@lexversion"/></strong>
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Test Date:
          <strong><xsl:value-of select="date"/></strong></p>
        <p>Test Type: <strong>paradigm</strong></p>
      </section>
    </section>
  </xsl:template>

  <xsl:template match="results">
      <section>
        <title>Paradigms Grouped by Word</title>
        <xsl:for-each select="word[generate-id(.)=generate-id(key('bugid',bug))]/bug">
          <xsl:sort select="." data-type="number"/> <!-- . = word/bug -->
          <p/>
          <section>
            <title>
              <xsl:value-of select="."/>
            </title>
          <table>
            <tr>
              <th>Input<br/>word</th>
              <th width="25%">Suggestions</th>
              <th>Comment</th>
            </tr>
            <xsl:for-each select="key('bugid', .)">
              <xsl:sort select="comment" order="descending" />
              <xsl:sort select="original" />
              <tr>
                <xsl:if test="(not(expected) and status = 'SplErr') or
                              (expected and status = 'SplCor')">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'broken'"/>
                  </xsl:attribute>
                </xsl:if>
                <td><xsl:value-of select="original"/></td>
                <td><xsl:apply-templates select="suggestions"/></td>
                <td><xsl:value-of select="comment"/></td>
              </tr>
            </xsl:for-each>
          </table>
          </section>
        </xsl:for-each>
      </section>

  </xsl:template>

  <xsl:template match="word">
    <xsl:param name="type"/>
    <tr>
      <xsl:if test="((not(expected) and status = 'SplErr') or
                     (expected and status = 'SplCor')       )
                    and
                     $type = 'nobug' ">
        <xsl:attribute name="class">
          <xsl:value-of select="'broken'"/>
        </xsl:attribute>
      </xsl:if>
      <td><xsl:value-of select="original"/></td>
      <xsl:if test="suggestions/@count > 0">
        <td>
          <xsl:apply-templates select="suggestions"/>
        </td>
      </xsl:if>
      <xsl:if test="$type = 'toSpErr' or
                    $type = 'toSpCor'">
        <td>
          <xsl:apply-templates select="tokens"/>
        </td>
      </xsl:if>
      <td>
        <xsl:apply-templates select="comment"/>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="suggestions|tokens">
    <ol>
      <xsl:apply-templates />
    </ol>
  </xsl:template>

  <xsl:template match="suggestion">
    <li>
      <xsl:if test="@expected">
        <xsl:attribute name="class">
          <xsl:value-of select="'correct'"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@penscore">
        <span class="score">
          (<xsl:value-of select="@penscore"/>)
        </span>
      </xsl:if>
      <xsl:apply-templates />
    </li>
  </xsl:template>

  <xsl:template match="token">
    <li>
      <xsl:apply-templates />
    </li>
  </xsl:template>

</xsl:stylesheet>
