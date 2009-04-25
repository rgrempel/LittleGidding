
xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each do |node|
      column = node.xpath("preceding-sibling::figure[@col] | ancestor-or-self::*[@col]").last
      node["col"] = column["col"] if column 
      xml << node.to_xml
    end
  end
end
