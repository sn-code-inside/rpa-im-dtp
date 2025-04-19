<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<Root>
			<xsl:for-each select="/Root/product">
				<product>
					<details>
						<name>
							<xsl:value-of select="./details/name"/>
						</name>
						<description>
							<xsl:value-of select="./details/description"/>
						</description>
						<modelno>
							<xsl:value-of select="./details/modelno"/>
						</modelno>
						<price>
							<xsl:value-of select="./details/price"/>
						</price>
					</details>
					<image>
						<xsl:variable name="href" select="./image/@href"/>
						<xsl:attribute name="href"><xsl:value-of select="$href"/></xsl:attribute>
					</image>
				</product>
			</xsl:for-each>
		</Root>
	</xsl:template>
</xsl:stylesheet>