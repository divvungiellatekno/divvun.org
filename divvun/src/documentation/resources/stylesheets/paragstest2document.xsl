<?xml version="1.0" encoding="UTF-8"?>
<!--+
    | Transforms corpus summary documents to Forrest documents
    +-->

<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- List of documents being processed: -->
 <xsl:key name="docnames" match="//@name/text()" use="."/>

<!--xsl:key name="product" match="/items/item/products/product/text()" use="." />

<xsl:template match="/">

  <xsl:for-each select="/items/item/products/product/text()[generate-id()=generate-id(key('product',.)[1])]">
    <li>
      <xsl:value-of select="."/>
    </li>
  </xsl:for-each>

</xsl:template-->

  <xsl:template match="/">
    <document>
      <header>
        <title>Parallelisation of Corpus Files — Test results</title>
      </header>
      <body>
        <h2>Documents</h2>
        <ul>
           <xsl:for-each select="//@name/text()[generate-id(.) = generate-id(key('docnames', .)[1])]">
             <li><xsl:value-of select="."/> ·</li>
           </xsl:for-each>
        </ul>
        <xsl:apply-templates select="paragstesting"/>
      </body>
    </document>
  </xsl:template>

  <xsl:template match="paragstesting">
    <table>
      <caption>Real parallelisation compared to exepcted result -
              # of failed sentence pairs / # of all sentence pairs</caption>
      <!--tr>
        <th>Test date⇓ \ Gold-standard files⇒</th>
        <xsl:for-each select="testrun/file">
          <th><xsl:value-of select="@name"/></th>
        </xsl:for-each>
        <th>Totals:</th>
      </tr-->
      <xsl:apply-templates select="testrun"/>
    </table>
  </xsl:template>

  <xsl:template match="testrun">
    <tr>
      <td><strong>Filename:</strong></td>
      <xsl:apply-templates select="file/@name"/>
    </tr>
    <tr>
      <td><strong><xsl:value-of select="@datetime"/></strong></td>
      <xsl:apply-templates select="file"/>
    <td><strong>
        <xsl:value-of select="sum(file/@diffpairs)"/> /
        <xsl:value-of select="sum(file/@gspairs)"/> =
        <xsl:value-of select="round((1 - (sum(file/@diffpairs) div
                              sum(file/@gspairs))) * 10000) div 100"/> %</strong>
    </td>
    </tr>
  </xsl:template>

  <xsl:template match="file/@name">
    <td>
      <xsl:choose>
        <!-- There are no diffs for the first two test runs, so skip link making: -->
        <xsl:when test="(ancestor-or-self::testrun/@datetime = '20111210-1155')
                     or (ancestor-or-self::testrun/@datetime = '20111214-1433')">
          <xsl:value-of select="translate(., '_', ' ')"/>
        </xsl:when>
        <!-- All other test runs have diffs, so create links to them: -->
        <xsl:otherwise>
          <a>
            <xsl:attribute name="href">
              <xsl:value-of select="concat('tca2testing/', ., '_', ancestor-or-self::testrun/@datetime, '.html')"/>
            </xsl:attribute>
            <xsl:value-of select="translate(., '_', ' ')"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </xsl:template>

  <xsl:template match="file">
    <td>
        <xsl:value-of select="@diffpairs"/> /
        <xsl:value-of select="@gspairs"/> =
        <xsl:value-of select="round((1 - (@diffpairs div @gspairs)) * 10000) div 100"/>
        %
    </td>
  </xsl:template>

</xsl:stylesheet>
