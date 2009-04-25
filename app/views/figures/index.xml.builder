
xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each do |node|
      column = node.xpath("ancestor-or-self::*[@col]")
      node["col"] = column[-1]["col"] if (column.length > 0) 
      xml << node.to_xml
    end
  end
end
