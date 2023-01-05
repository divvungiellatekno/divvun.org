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

  <xsl:param name="overviewlang"/>

  <!-- Constant holding the paragraph limit for lumping files together -
       files with less or equal number of paragraphs will not be listed
       separately, only counted and summarized. -->
  <xsl:variable name="plimit" select="50"/>

  <!-- Constant holding the file number limit for lumping files together -
       if there are less files than the given limit with less paragraphs
       than defined above, the lumping will NOT happen, and they will instead
       be listed normally. -->
  <xsl:variable name="flimit" select="50"/>

  <xsl:template match="summary">
    <document>
      <header>
        <title>Corpus Content —
          <i18n:text>
            <xsl:value-of select="$overviewlang"/>
          </i18n:text>:
          <xsl:value-of select="count/total/language[@xml:lang = $overviewlang]/@count"/>
          files.
        </title>
      </header>
      <body>
        <xsl:choose>
          <xsl:when test="./language[@xml:lang = $overviewlang]">
            <xsl:apply-templates select="./language[@xml:lang = $overviewlang]"/>
          </xsl:when>
          <xsl:otherwise>
            <warning>No information found for
              <xsl:value-of select="$overviewlang"/>. Please report to
              feedback@divvun.no.
            </warning>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </document>
  </xsl:template>

  <xsl:template match="summary/language[@xml:lang = $overviewlang]">
    <p>Below is a list of all corpus files for
    <xsl:value-of select="@xml:lang"/>,
    grouped according to genre. Some files might be invalid in one way or the
    other, these are <span class="nonvalid">colour marked</span>. Also files
    with a missing license declaration are marked <span class="nonvalid">with
    the same colour</span> (but only in the license field).</p>
    <p>Small files are lumped together at the end if there are more than
    <xsl:value-of select="$flimit"/> of them.</p>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="genre">
    <xsl:variable name="genrename" select="@name"/>
    <section>
      <title>
        <xsl:value-of select="@name"/> —
        <xsl:value-of select="count(file)"/>
        <xsl:choose>
          <xsl:when test="count(file) = 1">
            file
          </xsl:when>
          <xsl:otherwise>
            files
          </xsl:otherwise>
        </xsl:choose>
      </title>
      <table>
        <tr>
          <th>Title</th>
          <th>No of sections</th>
          <th>No of paragraphs</th>
          <th>No of words</th>
          <th>License</th>
          <th>Orig. lang.</th>
          <th>Filename</th>
        </tr>
        <!--xsl:choose>
          <xsl:when test="count(file[size/pcount > $plimit]) > $flimit"-->
            <xsl:apply-templates select="file[size/pcount > $plimit]">
              <xsl:sort select="size/pcount" data-type="number" order="descending"/>
            </xsl:apply-templates >
            <xsl:if test="file[size/pcount &lt;= $plimit]">
              <tr>
                <td>
                <xsl:value-of select="count(file[size/pcount &lt;= $plimit])"/>
                other
                <xsl:choose>
                  <xsl:when test="count(file[size/pcount &lt;= $plimit]) = 1">
                    file
                  </xsl:when>
                  <xsl:otherwise>
                    files
                  </xsl:otherwise>
                </xsl:choose>
                (&lt;= <xsl:value-of select="$plimit"/> paragraphs)</td>
                <td><xsl:value-of select="sum(file[size/pcount &lt;= $plimit]/size/sectioncount)"/></td>
                <td><xsl:value-of select="sum(file[size/pcount &lt;= $plimit]/size/pcount)"/></td>
                <td><xsl:value-of select="sum(file[size/pcount &lt;= $plimit]/size/wordcount)"/></td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            </xsl:if>
          <!--/xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="file">
              <xsl:sort select="size/pcount" data-type="number" order="descending"/>
            </xsl:apply-templates >
          </xsl:otherwise>
        </xsl:choose-->
      </table>
    </section>
  </xsl:template>

  <xsl:template match="file">
    <tr>
      <xsl:if test="nonvalid">
        <xsl:attribute name="class">nonvalid</xsl:attribute>
      </xsl:if>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="size/sectioncount"/></td>
      <td><xsl:value-of select="size/pcount"/></td>
      <td><xsl:value-of select="size/wordcount"/></td>
      <td>
        <xsl:choose>
          <xsl:when test="availability/free">
            free
          </xsl:when>
          <xsl:when test="availability/license">
            <b>Licensed</b>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="class">nonvalid</xsl:attribute>
            <i>not yet known</i>
          </xsl:otherwise>
        </xsl:choose>
      </td>
      <td>
        <xsl:choose>
          <xsl:when test="translated_from">
            <xsl:value-of select="translated_from/@xml:lang"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text> </xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </td>
      <td><xsl:value-of select="filename"/></td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
