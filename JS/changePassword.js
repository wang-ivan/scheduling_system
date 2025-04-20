// FILEPATH: /c:/Users/yifan/Desktop/scheduling system/JS/changePassword.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('changePasswordForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 檢查新密碼是否匹配
        if (newPassword !== confirmPassword) {
            alert('新密碼和確認密碼不一樣');
            return;
        }

        
        changePassword(currentPassword, newPassword);
    });
});


 function changePassword(currentPassword, newPassword) {
    var ref = db.collection('login').doc('account');
    ref.get().then(doc => {
        const account = doc.data();
        
        if (currentPassword !== account.password) {
            alert('目前密碼錯誤');
            return
        } else {     
            updatePassword(newPassword)
            setTimeout(() => {
                document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = 'login.html';
                alert('密碼修改成功，請重新登入');
            }, 500);  
            
        }
        
    });
    
    
}

function updatePassword(newPassword) {
    var ref = db.collection('login').doc('account');
    ref.update({
        password: newPassword
    });
}