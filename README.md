
1- Setup instructions

Projeyi çekip docker compose up --build -d ile çalıştırmanız yeterli.
npm install, build ve migration, redis ve postresql kullanıcıları gibi gerekli kurumlumlar Dockerfile ve docker-compose.yml dosyalarında çalıştığında yapılıyor olcak.
.env dosyasını mail yolu ile size iletmiş olacağım.
Projenin canlıda ki örneği client=https://www.adnanfurkanaktemur.com.tr, server = https://www.adnanfurkanaktemur.com.tr/server , swagger ile oluşturduğum api dökümanı ise https://www.adnanfurkanaktemur.com.tr/api-docs altında bulabilirsiniz.
 
2- API documentationSwagger or Postman collection)

İsterseniz canlı ortamda https://www.adnanfurkanaktemur.com.tr/api-docs altında bulabilirsiniz, isterseniz projeyi localde docker ile ayağa kaldırdıktan sonra .envde ki PORT değerine göre http://localhost:PORT/api-docs şeklinde bakabilirsiniz

3- Explanation of the chosen architecture and design decisions

Proje bana iletilen dökümanda istenildiği üzere backend tarafında express.js, typescript ile yazılmıştır. Veri tabanı olarak postresql, veri önbellekleme için redis kullanıldı. Api istekleri için axios kullanıldı api isteği atılan kaynaklar ise news api ve guardian api seçildi. Bunların hepsi(backend, redis, postresql) birer docker 
container'ı olarak aynı docker ağı içinde çalışacak şekilde tasarlandı (docker-compose.yml). 
Frontend tarafında ise Next.js ile birlikte React.js olarak yazıldı. Backende istek atmak için bir api-context ve kullanıcı işlemleri için ise auth context yazıldı.
Backendin çalışma mantığından kısaca bahsetmek gerekirse: 
  - Ön taraftan kullanıcı giriş yapar, eğer hesabı yok ise kayıt olur sonra giriş yapar(Kayıt olmadan diğer sayfaları göremez middleware engeller). 
  - Giriş yaptıktan sonra dashboard ekranı açılır burada kullanıcının kendi tercihlerine göre haberler gelir.ilk girişte bi tercihi olmadığı için default değerler ile gelir.
  - Dashbıard kısmında önce bir önbellek var mı diye redise bakar yok ise news api ve guardian api dan çeker ve bunları bi daha kullanmak üzere redise yazar. artık aynı tercihlerde bir istek gelirse redisten gelir.
  - Kullanıcı profil settings kısmında filtrelerini seçebilir. bunlar aynı zamanta giriş yapılınca oluşturulan token'a da yazılır.Token ise backendde bulunan bir middleware sayesinde çözümlenip filtreler fonksiyonlara gönderilir bu sayade dashboard ekranında gelen haberer tokenda ki filtrelere göre varsa redisten veya api kaynaklarından gelir.
  - navbarda bulunan news kısmında ise ilk başta default filtrelere göre bütün haberler gelir kullanıcı bunlar içinde filtreleyerek gezebilir.
  - Filtreler kısmında bulunan yazarlar, kaynaklar gibi bir çok filtre unsuru da önce redise bakılır var ise oradan çekilir yoksa redise yazılıp ön tarafa gönderilir sonra ki isteklerde redisten gelir.
  - Rediste tutulan veriler sadece belli bi süre tutulur bu süre sonunda silinir.
  - Veri tabanında sadece iki tablo var biri user biri migration tablosu.

4- CI/CD and deployment strategy details (optional)
Projeyi bir ubuntu servera github ssh ile çektim.
Sunucuya gerekli kurulumları yapıyoruz.(docker, nginx, lets encrypt vs)
Projeyi docker compose up --build -d komutu ile ayağa kaldırdıktan sonra nginxi gelen istekleri yönlendirmesi için sites-available içinde ayarlarımızı domainimize göre yapıyoruz.
Domaini aldığım firmadan ise domainime gelen istekleri sunucumun ip adresine yönlendirdim(a kaydı vs.)
https olarak şifrelenmiş bir biçimde çalışması için ücretsiz olan lets encrypt ike ssl sertifikası verdim.
nginx config dosyam aşağıda ki gibidir
server {
    server_name adnanfurkanaktemur.com.tr;

    # www’suz istekleri www'ye yönlendir
    return 301 http://www.adnanfurkanaktemur.com.tr$request_uri;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/adnanfurkanaktemur.com.tr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/adnanfurkanaktemur.com.tr/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    server_name www.adnanfurkanaktemur.com.tr;

    location /server/ {
        proxy_pass http://localhost:3003/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    location / {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/adnanfurkanaktemur.com.tr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/adnanfurkanaktemur.com.tr/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = adnanfurkanaktemur.com.tr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    listen 80;
    server_name adnanfurkanaktemur.com.tr;
    return 404; # managed by Certbot


}

server {
    if ($host = www.adnanfurkanaktemur.com.tr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name www.adnanfurkanaktemur.com.tr;
    return 404; # managed by Certbot


}
nginx bu domainimden gelen istekleri doğrudan yukarıda ki gibi yönlendirecek.
