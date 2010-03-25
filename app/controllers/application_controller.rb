# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

require 'nokogiri'

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  helper_method :current_scholar_session, :current_scholar
  # protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  filter_parameter_logging :password, :password_confirmation

  before_filter :check_gospel, :checkIsomorphicDebug
  @@gospel ||= "initialize"
  @@gospel_mod_time ||= 0

  GOSPEL_PATH = "#{Rails.root}/public/gospelgrab13.xml"

private
  
  def checkIsomorphicDebug
    @isomorphicDebug = params.has_key?(:isomorphicDebug)
  end

  # Call this one when you want to write ... it will get an exclusive lock, reload
  # if necessary, yield, and then write if you return true from the block
  def write_gospel
    open_gospel "r+" do |f|
      Rails.logger.info "Reloading XML for modification"
      @@gospel = Nokogiri::XML(f)
      @@gospel_mod_time = f.mtime
      # Then yield for modification ... if true, then write it out
      if yield @@gospel
        Rails.logger.warn "Writing new XML"
        f.truncate(0)
        f.rewind
        @@gospel.write_xml_to(f, :encoding => 'UTF-8')
        @@gospel_mod_time = f.mtime
      end
    end
  end
  
  def reload_gospel
    open_gospel do |f|
      Rails.logger.info "Reloading XML"
      @@gospel = Nokogiri::XML(f)
      @@gospel_mod_time = f.mtime
    end
  end

  def open_gospel mode='r'
    file = File.new(GOSPEL_PATH)
    file.flock(mode == 'r' ? File::LOCK_SH : File::LOCK_EX)
    begin
      File.open(GOSPEL_PATH, mode) do |f|
        yield f
      end 
    ensure
      file.flock(File::LOCK_UN)
    end
  end

  def check_gospel  
    if @@gospel == "initialize"
      Rails.logger.info "Reloading XML because first request"
      reload_gospel
    elsif @@gospel_mod_time != File.mtime(GOSPEL_PATH)
      Rails.logger.info "Reloading XML because it has changed"
      reload_gospel
    end
  end

  def current_scholar_session
    return @current_scholar_session if defined?(@current_scholar_session)
    @current_scholar_session = ScholarSession.find
  end
  
  def current_scholar
    return @current_scholar if defined?(@current_scholar)
    @current_scholar = current_scholar_session && current_scholar_session.record
  end
  
  def require_scholar
    unless current_scholar
      respond_to do |format|
        format.xml do
          response = <<-END
            <response>
              <status>-1</status>
              <data>You must login to view this item</data>
            </response>
          END
          render :xml => response, :status => 403 
        end

        format.all do
          render :text => "You must login to view this item", :status => 403
        end
      end

      return false
    end
  end

  def require_no_scholar
    if current_scholar
      store_location
      flash[:notice] = "You must be logged out to access this page"
      redirect_to account_url
      return false
    end
  end
  
  def store_location
    session[:return_to] = request.request_uri
  end
  
  def redirect_back_or_default(default)
    redirect_to(session[:return_to] || default)
    session[:return_to] = nil
  end
end
