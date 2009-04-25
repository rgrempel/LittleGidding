module TextHelper
  def apply xml, node
    if node.node_type == Nokogiri::XML::Node::ELEMENT_NODE
      send "render_#{node.name}", xml, node
    elsif node.node_type == Nokogiri::XML::Node::TEXT_NODE
      xml << node.text
    end
  end

  def apply_children xml, node
    node.children.each do |child|
      apply xml, child
    end
  end

  def apply_record xml, node
    hchapter = node.xpath("ancestor-or-self::hchapter").first
    column = if node.key?("col")
      node
    else
      node.xpath("preceding-sibling::*[@col] | ancestor::*[@col]").last
    end
    col = column ? column["col"] : ""
    xml.record :hchapter => hchapter["n"],
               :col => col,
               :type => node.name do
      yield
    end
  end

  def apply_html xml
    buffer = ""
    builder = Builder::XmlMarkup.new(:target => buffer)
    yield builder
    xml.html buffer
  end

  def render_hchapter xml, node
    apply_record xml, node do
      apply_html xml do |html|
        html.div :class => "hchapter" do
          html.text! "#{node["n"]} "
          head = node.xpath("head")
          if head.length > 0
            apply_children html, head.first
          else
            html.text! node["toctitle"] if node.key?("toctitle")
          end
        end
      end
    end
  end

  def render_hi xml, node
    xml.span :class => node["rend"].tr('()','') do
      apply_children xml, node
    end
  end

  def render_figure xml, node
    apply_record xml, node do
      apply_html xml do |html|
        html.div :class => "figure" do
          node.xpath("figDesc | head | text").each do |child|
            apply html, child
          end
        end
      end
    end
  end

  def render_figDesc xml, node
    xml.div :class => "figDesc" do
      apply_children xml, node
    end
  end

  def render_head xml, node
    xml.div :class => "figHead" do
      apply_children xml, node
    end
  end

  def render_text xml, node
    xml.div :class => "figText" do
      apply_children xml, node
    end
  end

  def render_comment xml, node
    apply_record xml, node do
      apply_html xml do |html|
        html.div :class => "comment" do
          apply_children html, node
        end
      end
    end
  end

  GOSPELS = {
    "a" => "Matthew", 
    "b" => "Mark", 
    "c" => "Luke",
    "d" =>"John"
  }

  def render_excerpt xml, node
    apply_record xml, node do
      source = if node.key?("source")
        (node["source"].gsub(/^([abcd])\./) {|match| "#{GOSPELS[$1]} " })
      else
        ""
      end
      xml.source source 
      apply_html xml do |html|
        html.div :class => node["type"] do
          apply_children html, node
        end
      end
    end
  end

  def render_verse xml, node
    xml.div :class => "verse" do
      xml.span({:class => "versenumber"}, node["vnumber"])
      xml.text! " "
      apply_children xml, node
    end
  end

  def render_link xml, node
    apply_record xml, node do
      apply_html xml do |html|
        html.div :class => "link" do
          apply_children html, node
        end
      end
    end
  end

  def render_textnote xml, node
    apply_record xml, node do
      apply_html xml do |html|
        html.div :class => "textnote" do
          apply_children html, node
        end
      end
    end
  end
end
