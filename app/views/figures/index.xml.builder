
xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each_with_index do |node, index|
      column = node.xpath("preceding-sibling::figure[@col] | ancestor-or-self::*[@col]").last
      node["col"] = column["col"].to_i.to_s if column
      node["position"] = (@startRow + index).to_s
      if @dataSource == "figures_summary"
        xml.figure :id => node["id"], :position => node["position"], :col => node["col"]
      else
        xml << node.to_xml
      end
    end
  end
end
