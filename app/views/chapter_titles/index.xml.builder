xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each do |node|
      xml.record :n => node[:n], :toctitle => node[:toctitle], :col => node[:col]
    end
  end
end
