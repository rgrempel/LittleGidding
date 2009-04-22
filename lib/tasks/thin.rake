namespace :thin do
  desc "Start thin"
  task :start do
    sh "thin -C /etc/thin/littlegidding.pauldyck.com start"
  end

  desc "Stop thin" 
  task :stop do
    sh "thin -C /etc/thin/littlegidding.pauldyck.com stop"
  end

  desc "Restart thin" 
  task :restart do
    sh "thin -C /etc/thin/littlegidding.pauldyck.com restart"
  end
end
