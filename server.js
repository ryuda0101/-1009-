// 설치한것을 불러들여 그 안의 함수 명령어들을 쓰기위해 변수로 세팅
const express = require("express");
// 데이터베이스의 데이터 입력, 출력을 위한 함수명령어 불러들이는 작업
const MongoClient = require("mongodb").MongoClient;
const app = express();

// 포트번호 변수로 세팅
const port = 8080;


// ejs 태그를 사용하기 위한 세팅
app.set("view engine","ejs");
// 사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({extended: true}));
// css나 img, js와 같은 정적인 파일 사용하려면 ↓ 하단의 코드를 작성해야한다.
app.use(express.static('public'));

// Mongodb 데이터 베이스 연결작업
// 데이터베이스 연결을 위한 변수 세팅 (변수의 이름은 자유롭게 지어도 ok)
let db;
// Mongodb에서 데이터베이스를 만들고 데이터베이스 클릭 → connect → Connect your application → 주소 복사, password에는 데이터베이스 만들때 썼었던 비밀번호를 입력해 준다.
MongoClient.connect("mongodb+srv://admin:asdf1234@hometest.h4tia5v.mongodb.net/?retryWrites=true&w=majority",function(err,result){
    // 에러가 발생했을 경우 메세지 출력 (선택사항임. 안쓴다고 해서 문제가 되지는 않는다.)
    if(err){ return console.log(err);}

    // 위에서 만든 db변수에 최종적으로 연결 / ()안에는 mongodb atlas에서 생성한 데이터 베이스 이름 집어넣기
    db = result.db("homeTest1009");

    // db연결이 제대로 되었다면 서버 실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });
});

// html과 같은 정적인 파일 보낼때는 app.get.sendFile(__dirname + "/불러들일 html파일 경로")
// ejs와 같은 동적인 파일 보낼때는 app.get.render("불러들일 ejs파일")
// 특정 주소로 이동해달라고 요청할때는 res.redirect("/이동할 경로")


// postinsert페이지에 가면 write.ejs 화면을 보여주기
app.get("/postContext",function(req,res){
    res.render("write.ejs");
});

// db의 dataList컬렉션에 write.ejs의 데이터를 담아준다.
app.post ("/postadd",function(req,res){
    // db에서 dataCount컬렉션의 게시물갯수라는 이름의 데이터를 찾아서 가져온다.
    db.collection("dataCount").findOne({name:"게시물갯수"},function(err,result){
        // write.ejs에서 가져온 데이터값을 title과 context라는 객체로 만들어서 데이터베이스의 dataList컬렉션에 담아주기
        db.collection("dataList").insertOne({
            count:result.totalCount + 1,
            title:req.body.title,
            context:req.body.context
        },function(err,result){
            // dataCount에서 게시물갯수라는 이름을 가진 데이터를 찾아서 totalCount를 1 증가시킨다.
            db.collection("dataCount").updateOne({name:"게시물갯수"},{$inc:{totalCount:1}},function(err,result){
                // 게시물을 작성 후 show페이지로 이동해서 작성한 글 볼수있도록 하기 
                res.redirect("/");
            });
        });
    });
});

// show.ejs로 보여준다.
app.get("/",function(req,res){
    db.collection("dataList").find().toArray(function(err,result){
        res.render("show",{postitem:result});
    });
});

// 데이터 수정하기
// 기존에 작성된 dataList의 데이터들을 가져와서 edit.ejs에 넣어준다.
app.get("/postEdit",function(req,res){
    db.collection("dataList").find({}).toArray(function(err,result){
        res.render("edit",{postitem:result});
    });
});

// edit.ejs에서 받아온 값을 넣어준다
app.post("/postEditDone",function(req,res){
    db.collection("dataList").update(
        // 변경될 숫자 값
        {
            count:Number(req.body.editNumber)
        },
        // 변경될 제목과 변경될 내용
        {
            $set:{title:req.body.editTitle, context:req.body.editContext}
        },
        function(err,result){
            res.redirect("/");
        }
    );
});



// 게시판 만들고 게시글 번호 부여하기
// 1. 데이터베이스에서 컬렉션을 2개 만든다.
//      하나는 데이터를 담을 컬렉션 / 하나는 데이터의 갯수를 담아줄 컬렉션
// 2. ejs를 3개 만들어준다.
//      하나는 데이터를 작성할 페이지 / 하나는 데이터를 수정할 페이지 / 하나는 데이터를 보여줄 페이지
// 3. db에서 데이터의 갯수를 담아줄 컬렉션에 insert document로 ObjectId를 string에서 Int32 또는 Int64로 바꿔주고 totalCount값을 만들고 그 안에 0을 담아준다. 또한 name으로 개시물갯수라는 객체를 추가로 만들어준다. 
// 4. db 컬렉션에서 findOne으로 갯수를 담아줄 컬렉션을 찾아서 가져온다.
// 5. app.post작업으로 데이터를 작성할 페이지.ejs에서 입력한 값을 객체형식으로 db의 컬렉션에 받아준다.
// 6. 데이터를 보여줄 페이지.ejs에서 db의 컬렉션에 담긴 값을 가져와서 화면에 보여준다.

// 데이터 수정하기
// 1. 기존의컬렉션의 데이터값을 가져와서 데이터를 수정할 페이지.ejs에 넣어준다.  
// 2. 데이터를 수정할 페이지.ejs에서 가져온 기존의 값을 컬렉션에.update({변경될 값},{변경될 값},function(req,res){})해서 수정해준다.
// 3. 수정해준 값이 화면에 보여지는지 확인한다.