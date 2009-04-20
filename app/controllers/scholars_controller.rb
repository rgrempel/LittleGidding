class ScholarsController < ApplicationController
  def create
    @scholar = Scholar.new({
      :full_name => params[:full_name],
      :email => params[:email],
      :institution => params[:institution]
    })

    if @scholar.save

    else

    end
  end
end
