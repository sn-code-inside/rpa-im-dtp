<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<Root>
			<Textabschnitt>
				<Tabelle>
					<xsl:for-each select="/data/post[CategoryID=59]">
						<xsl:sort select="./Title"/>
						<xsl:if test="not(RegularPrice>10)">
							<Zelle/>
							<Zelle>
								<Title>
									<xsl:value-of select="./Title"/>
								</Title>
								<Author>
									<xsl:value-of select="./Author"/>
								</Author>
							</Zelle>
							<Zelle>
								<RegularPrice>
									<xsl:value-of select="./RegularPrice"/>
								</RegularPrice>
							</Zelle>
							<Zelle>
								<SKU>
									<xsl:value-of select="./SKU"/>
								</SKU>
							</Zelle>
						</xsl:if>
					</xsl:for-each>
				</Tabelle>
			</Textabschnitt>
		</Root>
	</xsl:template>
</xsl:stylesheet>