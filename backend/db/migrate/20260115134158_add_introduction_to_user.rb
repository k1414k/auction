class AddIntroductionToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :introduction, :text, default: "ここを押して自己紹介を自由に書いてみましょう。"
  end
end
