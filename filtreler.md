## Filtreleme özellikleri

### Kullanım:
```
başlık(zorunlu değil) #özellik:değer
```
#### örnekler:
```
tantei #maxmalp:7 #minmalp:6 #sort:malp #orderby:asc
```
```
#minwords:7 #maxwords:10
```

### Filtreler:

- `malp`: `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `minmalp`: Minimum `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `maxmalp`: Maximum `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `wordcount`: Kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `minwords`: Minimum kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `maxwords`: Maximum kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `eps`: Bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `minwords`: Minimum bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `maxwords`: Maximum bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `year`: Yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `minyear`: Minimum yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `maxyear`: Maximum yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `sort`: Sıralama filtresi
  - Değerler:
    - `malp`: `MyAnimeList` puanına göre sıralar.
    - `year`: Yılına göre sıralar.
    - `wordcount`: Kelime sayısına göre sıralar.
    - `title`: Başlığa göre sıralar.
    - `sim`: Başlık benzerliğine göre sıralar.
- `orderby`: Sıralama düzeni filtresi
  - Değerler:
    - `asc`: Düşükten yükseğe sıralar.
    - `desc`: Yüksekten düşüğe sıralar.

> [!NOTE]
> **Eklenme tarihine ve bölüm sayısında göre yapılan filtrelemeler hatalı sonuçlar gösterebilir bunun nedeni genellikle veri setinin hatalı olmasıdır. Bu Anizm yetkililerinden kaynaklı bir durum kodla alakalı değil.**
