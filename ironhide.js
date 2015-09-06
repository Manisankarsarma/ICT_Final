

WorkSpace = new Mongo.Collection('workspace');
WorkSpaceUsers = new Mongo.Collection('WSusers');
WorkSpaceFiles = new Mongo.Collection('WSFiles');
Files = new Mongo.Collection('files');


if (Meteor.isClient) {
        
        Meteor.subscribe('WSusers');
        Meteor.subscribe('files');
        Meteor.subscribe('WSFiles');
    
Meteor.startup(function () {
  /*Session.setDefault("templateName", "home")*/
});
    
    Template.backupWSkey.helpers({
       
    WSkey: function()
        {
            return Session.get("WSkey");
        }
        
        
    });

Template.body.helpers({
  template_name: function(){
      
    if(Meteor.userId())
    {
        if(Session.get("twoFAverified"))
            { 
                if(Session.get("createWS"))
                {
                    
                    if(Session.get("backupWS"))
                        {
                            if(Session.get("manageWSusers"))
                            {
                                if(Session.get("ViewWSFiles"))
                                
                                {
                                    return "workspaceFiles"
                                }
                                
                                else
                                {
                                    return "manageWSusers"
                                }
                            }
                            
                            else
                            {
                                return "backupWSkey"
                            }
                        }
                    else{
                        return "createWorkspace"
                        }
                }
                else if(Session.get("existWS"))
                { 
                    return "existWorkspace"
                }
                else {return "workspaceHome"}
                
            }
            
        else {return "twoFA"}
    }
    else 
    {
        return "home" /*Session.get("templateName")*/
    }
    }
});
    
    
    
 Template.twoFA.events({
    'click .twoFAbutton': function () 
     {
      
        console.log("Clicked 2FA sent button")
        Meteor.call('send2FAtoken', function(error,result){console.log(result)});
        
        
    },
     
     'submit form': function(event)
            {
                event.preventDefault();
             
                var twoFAtoken = event.target.twoFAtoken.value;
                
                Meteor.call('check2FAtoken',twoFAtoken,function(error,result){Session.set("twoFAverified",result)});
                console.log("Verifying 2FA Token")
                console.log(Session.get("twoFAverified"));
               
                
            }
     
     
     
  });
    
  Template.workspaceHome.events({
      
      'click .createWorkspaceButton': function () 
     {
      
        console.log("Create Workspace");
        Session.set("createWS",true);
        
                
        
    },
      
      
      'click .existWorkspaceButton': function () 
     {
      
        console.log("Existing Workspace")
        Session.set("existWS",true);
        
      
     }
      
      
  });
    
    
    
    Template.createWorkspace.events({
       
        'submit form': function(event)
            {
                event.preventDefault();
             
                var wsName = event.target.wsName.value;
                
                var enPswd = event.target.enPswd.value;
                
                var currentUserEmail = Meteor.user().emails[0].address;
                
                Session.set("encryptionPswd",enPswd);  
                
                var randomSaltPswd = Random.id([20]);
                var randomSaltWS = Random.id([20]);
                enPswdCiphertxt = CryptoJS.AES.encrypt(enPswd, randomSaltPswd);
                Session.set("WSkey", enPswdCiphertxt.toString());
                var pswdSaltcombined = enPswd+randomSaltWS;
                Session.set("WSencryptionPswd",pswdSaltcombined);
                
                
                                                   Meteor.call('AddWorkspace',wsName,randomSaltPswd,randomSaltWS,currentUserEmail);
                Meteor.call('AddWSusers',wsName,currentUserEmail,true);
                
                
                Session.set("currWS",wsName)
                
                console.log("Clientside New Workspace");
                
                Session.set("backupWS",true);
                
                
            }
     
        
        
        
    });
    
    
    Template.backupWSkey.events({
       
        'click .gotoManageUsers': function () 
     {
         console.log("you clicked gotoManageUsers button")
      
        Session.set("manageWSusers",true);
                      
     }
        
    });
    
    
    Template.manageWSusers.helpers({
       
        'WSusers': function(){ 
            console.log(WorkSpaceUsers.find({}).fetch());
            return WorkSpaceUsers.find({workspaceName: Session.get("currWS")})
                             },
        
        'selectedUser': function(){
            
            console.log("Going to display the selected user")
            return Session.get("selectedUser");
                                  }
        
        
        
        
        
    });
    
    Template.manageWSusers.events({
       
        'submit form': function(event)
            {
                event.preventDefault();
             
                var newUser = event.target.newUser.value;
                
                var wsName = Session.get("currWS");
                
                Meteor.call('AddWSusers',wsName,newUser,false);
                
                
                
                
            },
        
         'click .removeUserButton': function(){
             
             console.log("Removing User");
             
             var wsName = Session.get("currWS");
             var user = Session.get("selectedUser");
             Meteor.call('RemoveUser',wsName,user);
             
                                              },
        
        'click .wsButton' : function(){
         
            Session.set("ViewWSFiles",true);
        }
        
        
        
        
            });
       
   
    Template.UserDetails.events({
    
        'click': function()
        {
            console.log("Clicked List")
            console.log(this.email)
            Session.set("selectedUser", this.email);
            
        }
        
    });
    
    Template.UserDetails.helpers({
    
    'selectedClass': function(){
            
            if(this.email == Session.get("selectedUser"))
            {
                console.log("found a match, inside selectedClass");
                return "selected";
            }
        else {return ''}
        
                                }
    });
    
    
    
Template.workspaceFiles.helpers({
    
    'buffer': function(){return Session.get("temp")},
    
    'fname': function(){return Session.get("fname")},
    
    'WSFilesHelper': function(){ 
           // console.log(WorkSpaceFiles.find({}).fetch());
            return WorkSpaceFiles.find({wsName: Session.get("currWS")})
                             },
        
        'selectedFile': function(){
            
            console.log("Going to display the selected file");
            return Session.get("selectedFile");
                                  }
        
        
    
    
});
    
    
Template.workspaceFiles.events({
  'change input' : function(event,template){ 
      
    var file = event.target.files[0]; //assuming 1 file only
    console.log("assigned file variable")
      if (!file) return;

    var reader = new FileReader(); //create a reader according to HTML5 File API

    reader.onload = function(event){          
      //var buffer = new Uint8Array(reader.result) // convert to binary
      var buffer = reader.result;
        
        
        encrypted = CryptoJS.AES.encrypt(buffer,Session.get("encryptionPswd"));
        
        console.log("encrypted already and about to insert into DB");
        var workspace = Session.get("currWS");
        var filename = file.name;
        
        
        
        Meteor.call('FileInsert', workspace,filename, encrypted);
      
        console.log("Executed File insert operation");
        
    }

    //reader.readAsArrayBuffer(file); //read the file as arraybuffer
    reader.readAsDataURL(file);
      
    },
    
    'click .decryptButton': function(){
    
        console.log("Fetching following file for decryption");
        
        console.log(this.name);
        
        var ciphertext = this.ciphertext;    
        decrypted = CryptoJS.AES.decrypt(ciphertext ,Session.get("encryptionPswd")).toString(CryptoJS.enc.Latin1);
    //  
        Session.set('temp',decrypted);
        Session.set('fname',file.name);
    
    
    }
    
        
    
    
    
    
    
});    

    
   Template.FileList.events({
    
        'click': function()
        {
            console.log("Clicked List")
            Session.set("selectedFile", this.name);
            
        }
        
    });
  
    

/*  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });*/
}

if (Meteor.isServer) {
  process.env.MAIL_URL="smtp://ironhide.secure@gmail.com:meteormama!@smtp.gmail.com:465/";
    
Meteor.publish('WSusers', function(){
    
return WorkSpaceUsers.find({})      }); /* This is potentially insecure. Needs improvement this to restrict local mongo DB to only current WS */
    
Meteor.publish('WSFiles', function(){return WorkSpaceFiles.find({})});
     
    
   Meteor.methods({
        
        'send2FAtoken': function()
        {
            var currentUserEmail = Meteor.user().emails[0].address;
             randomToken = Random.id([8]);
            
            console.log("Sending the token");
            console.log(randomToken);
            console.log("to");
            console.log(currentUserEmail);
            
                
            Email.send({
                            from: "ironhide.secure@gmail.com",
                            to: currentUserEmail,
                            subject: "2FA token",
                            text: randomToken
                      }); 
            return "2FA token succesfully delivered";
        },
       
       'check2FAtoken': function(twoFAtoken)
       {
           
            console.log("Inside check2FAtoken function");
            console.log(randomToken);
            
            if(twoFAtoken===randomToken){return true}
            else { return false }   
           
       },
       
       'AddWorkspace':function(wsName,randomSaltPswd,randomSaltWS,adminEmail)
       {
           WorkSpace.insert({name:wsName, PswdSalt: randomSaltPswd,                       wsSalt: randomSaltWS, createdBy: adminEmail});
           
           currWS =wsName;
      
        console.log("Server Added New Workspace");
        console.log(WorkSpace.find().fetch())
       },
       
       'AddWSusers':function(wsName,userEmail,adminStatus)
       {
           WorkSpaceUsers.insert({workspaceName: wsName, email: userEmail, admin: adminStatus });
      
        console.log("Added new user to Workspace");
        console.log(WorkSpaceUsers.find().fetch())
       },
       
       'RemoveUser':function(wsName,userEmail)
       {
           WorkSpaceUsers.remove({workspaceName: wsName, email: userEmail, admin: false });
           console.log("Removing user, server side")
        
       },
       
       'FileInsert': function(workspaceName, filename, fileciphertext)
       {
           console.log("Inside method Fileinsert")
           WorkSpaceFiles.insert({wsName: workspaceName, name: filename,ciphertext: fileciphertext});
           
           console.log("Inserted file into database")
       },
       
       'saveFile': function(buffer){
        
        Files.insert({data:buffer});
        console.log("Inserted File into database");
       // console.log(Files.find().fetch());
           
    } 
       
       
       
       
      
       
   })
     
    
    Meteor.startup(function () {
    // code to run on server at startup
    
    });
}
