xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each_with_index do |node, index|
      node["position"] = (@startRow + index).to_s
      if @dataSource == "text_summary" then
        apply_summary xml, node
      else
        apply xml, node
      end
    end
  end
end
