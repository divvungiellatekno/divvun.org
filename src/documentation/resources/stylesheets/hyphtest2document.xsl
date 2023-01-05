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
  <xsl:param name="toplimit">5</xsl:param>
  <xsl:param name="bugurl">http://giellatekno.uit.no/bugzilla/show_bug.cgi?id=</xsl:param>

  <xsl:key name="bugid" match="word" use="./bug"/>

  <xsl:template match="spelltestresult">
    <document>
      <header>
        <title>Hyphenator Test Results for:
          «<xsl:value-of select="header/document"/>»
        </title>
      </header>
      <body>
        <xsl:apply-templates />
      </body>
    </document>
  </xsl:template>

  <xsl:template match="header">
    <xsl:param name="nrwords" select="count(../results/word)"/>
    <xsl:param name="nrflaggedwords"
     select="count(../results/word[status='SplErr'])"/>
    <xsl:param name="nrflaggedwordsprcnt"
     select="round(($nrflaggedwords div $nrwords) * 10000) div 100"/>
    <xsl:param name="nracceptwords"
     select="count(../results/word[status='SplCor'])"/>
    <xsl:param name="truepositive"
     select="count(../results/word[status='SplErr' and ./expected])"/>
    <xsl:param name="falsepositive"
     select="count(../results/word[status='SplErr' and not(./expected)])"/>
    <xsl:param name="nrrealerr" select="count(../results/word[expected])"/>
    <xsl:param name="truenegative"
     select="count(../results/word[status='SplCor' and not(./expected)])"/>
    <xsl:param name="falsenegative"
     select="count(../results/word[status='SplCor' and ./expected])"/>
    <xsl:param name="nrrealcorr" select="count(../results/word[not(expected)])"/>
    <xsl:param name="precision" select="$truepositive div ($truepositive + $falsepositive)"/>
    <xsl:param name="recall" select="$truepositive div ($truepositive + $falsenegative)"/>
    <xsl:param name="accuracy" select="($truepositive+$truenegative) div
                            ($nrflaggedwords + $nracceptwords)"/>
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
        <p>Hyphenation tool:
          <xsl:choose>
            <xsl:when test="tool/@type = 'pl'">
              <strong>Polderland command line tool</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'mw'">
              <strong>AppleScript driving MS Word</strong>
            </xsl:when>
            <xsl:when test="tool/@type = 'hu'">
              <strong>Hunspell, command line version</strong>
            </xsl:when>
            <xsl:otherwise>Unknown</xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Hyphenation tool version:
          <xsl:choose>
            <xsl:when test="tool/@toolversion = ''">Unknown</xsl:when>
            <xsl:otherwise>
              <strong><xsl:value-of select="tool/@toolversion"/></strong>
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Hyphenation lexicon version:
          <xsl:choose>
            <xsl:when test="tool/@lexversion = ''">Unknown</xsl:when>
            <xsl:otherwise>
              <strong><xsl:value-of select="tool/@lexversion"/></strong>
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <p>Test Date:
          <strong><xsl:value-of select="date"/></strong></p>
        <p>Test Type:
          <xsl:choose>
            <xsl:when test="$testtype = 'regression' or
                            $testtype = 'wordtypes' ">
              <strong><xsl:value-of select="$testtype"/></strong>
            </xsl:when>
            <xsl:otherwise>
              <strong>correct-corpus</strong>
            </xsl:otherwise>
          </xsl:choose>
        </p>
      </section>
      <section>
        <title>Result summary</title>
        <p>Number of input words:
        <strong><xsl:value-of select="$nrwords"/></strong></p>
        <table>
          <caption>Precision and Recall</caption>
          <tr>
            <td colspan="2" rowspan="2"/>
            <th colspan="2">Speller view</th>
          </tr>
          <tr>
            <td>Speller Positive<br/>
              (number of flagged words):<br/>
              <strong><xsl:value-of select="$nrflaggedwords"/></strong></td>
            <td>Speller Negative<br/>
              (number of accepted words):<br/>
              <strong><xsl:value-of select="$nracceptwords"/></strong></td>
          </tr>
          <tr>
            <th rowspan="2">Reality</th>
            <td>Number of real errors:<br/>
              <strong><xsl:value-of select="$nrrealerr"/></strong></td>
            <td>Number of true positives<br/>
              (detected real errors):<br/>
              <strong><xsl:value-of select="$truepositive"/></strong></td>
            <td>Number of false negatives<br/>
              (unflagged spelling errors):<br/>
              <strong><xsl:value-of select="$falsenegative"/></strong></td>
          </tr>
          <tr>
            <td>Number of real correct words:<br/>
              <strong><xsl:value-of select="$nrrealcorr"/></strong></td>
            <td>Number of false positives<br/>
              (incorrectly flagged words):<br/>
              <strong><xsl:value-of select="$falsepositive"/></strong></td>
            <td>Number of true negatives<br/>
              (unflagged correct words):<br/>
              <strong><xsl:value-of select="$truenegative"/></strong></td>
          </tr>
        </table>

        <xsl:if test="count(../results/word[status='Error'][expected]) > 0">
          <p><strong><xsl:value-of select="$errorinput"/> input word(s)</strong>
          was/were discarded because the speller (or MS Word) could not deal with them
          properly. The calculation of Precision, Recall and Accuracy below does
          <strong>NOT</strong> include this/these word(s).</p>
        </xsl:if>

        <dl>
          <dt>Precision (tp/(tp+fp)):</dt>
            <dd><xsl:value-of select="round($precision * 10000) div 100"/> %</dd>
          <dt>Recall (tp/(tp+fn)):</dt>
            <dd><xsl:value-of select="round($recall * 10000) div 100"/> %</dd>
          <dt>Accuracy ((tp+tn)/words):</dt>
            <dd><xsl:value-of select="round($accuracy * 10000) div 100"/> %</dd>
        </dl>

      </section>
      <section>
        <title>Colour Codes</title>
        <dl>
          <dt>Uncoloured table rows</dt>
            <dd>Test passed</dd>
          <dt>Table row with pink background</dt>
            <dd class="broken">Test failed - either missing or wrong (or both) hyphenation points</dd>
          <dt>Yellow hyphen</dt>
            <dd><span class="missing">-</span> Missing hyphenation point (found in the correct string, but not in the hyphenated string)</dd>
          <dt>Red hyphen</dt>
            <dd><span class="error">-</span> Wrong hyphenation point (found in the hyphenated string, but not in the correct string)</dd>
        </dl>
        <note>Some of the test data may contain deliberate typos, to test the
        performance of the hyphenator in such cases. These contain almost
        always one error or more. This is expected, perfect hyphenation can
        <strong>not</strong> be guaranteed on misspelled text. Typos are always clearly marked at
        the beginning of the comment field. So please check the comment before
        judging the hyphenation test result.</note>
      </section>
    </section>
  </xsl:template>

  <xsl:template match="results">
    <xsl:if test="$testtype = 'regression'">
      <section>
        <title>Grouped by bug #</title>
        <xsl:for-each select="word[generate-id(.)=generate-id(key('bugid',bug))]/bug">
          <xsl:sort select="." data-type="number"/> <!-- . = word/bug -->
          <p/>
          <table>
            <caption>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="concat($bugurl,.)"/>
                </xsl:attribute>
                <xsl:value-of select="."/>
              </a>
            </caption>
            <tr>
              <th>Input<br/>word</th>
              <th>Correct<br/>hyphenation</th>
              <th>Actual<br/>hyphenation</th>
              <th>Number of<br/>errors</th>
              <th>Comment</th>
            </tr>
            <xsl:for-each select="key('bugid', .)">
              <xsl:sort select="edit_dist" order="descending"/>
              <tr>
                <xsl:if test="(expected/missing) or
                              (hyphenated/error)">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'broken'"/>
                  </xsl:attribute>
                </xsl:if>
                <xsl:if test="edit_dist = 0">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'correct'"/>
                  </xsl:attribute>
                </xsl:if>
                <td><xsl:value-of select="original"/></td>
                <td><xsl:apply-templates select="expected"/></td>
                <td><xsl:apply-templates select="hyphenated"/></td>
                <td><xsl:value-of select="edit_dist"/></td>
                <td><xsl:value-of select="comment"/></td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:for-each>
      </section>
    </xsl:if>

    <xsl:if test="$testtype = 'wordtypes' ">
      <section>
        <title>Tests for different word constructions</title>
          <table>
            <tr>
              <th>Input<br/>word</th>
              <th>Correct<br/>hyphenation</th>
              <th>Actual<br/>hyphenation</th>
              <th>Number of<br/>errors</th>
              <th>Comment</th>
            </tr>
            <xsl:for-each select="word">
              <!--xsl:sort select="edit_dist" order="descending"/-->
              <tr>
                <xsl:if test="(expected/missing) or
                              (hyphenated/error)">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'broken'"/>
                  </xsl:attribute>
                </xsl:if>
                <xsl:if test="edit_dist = 0">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'correct'"/>
                  </xsl:attribute>
                </xsl:if>
                <td><xsl:value-of select="original"/></td>
                <td><xsl:apply-templates select="expected"/></td>
                <td><xsl:apply-templates select="hyphenated"/></td>
                <td><xsl:value-of select="edit_dist"/></td>
                <td><xsl:value-of select="comment"/></td>
              </tr>
            </xsl:for-each>
          </table>
      </section>
    </xsl:if>

  </xsl:template>

  <xsl:template match="missing">
    <span class="missing">
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="error">
    <span class="error">
      <xsl:apply-templates />
    </span>
  </xsl:template>

</xsl:stylesheet>
