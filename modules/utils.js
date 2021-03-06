
// UTILITY FUNCTIONS ----------------------
function Utils() {
    var interval = 0;

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
      };

    this.escape = function(pageTitle) {
        return encodeURI(pageTitle).replaceAll("&", "%26")
                                    .replaceAll("+","%2B");
      }
    this.startAnim = function(word, speed){
        let counter = 0;
        interval = setInterval(function() {
            if(counter == 0) {
                console.log(`  . ${word} .  `);
                counter ++;
                } else if(counter == 1) {
                console.log(` .. ${word} .. `);
                counter ++;
                } else if(counter == 2){
                console.log(`... ${word} ...`);
                counter ++;
                } else {
                console.log(` .. ${word} .. `);
                counter = 0;
            }
        }, speed);
      }
    
    this.stopAnim = function(){
        clearInterval(interval);
    }

    
    this.doesContain = function(checkPage, pageLst) {
        for(var idx in pageLst) {
          if(checkPage.title == pageLst[idx].title) {
            return true;
          }
        }
        return false;
      }
    
    this.filterPages = function(pages) {
        let newPages = [];
        for(var idx in pages) {
          if(!this.doesContain(pages[idx], newPages)) {
            newPages.push({
              title: pages[idx].title,
              pageid: pages[idx].pageid
            });
          }
        }
        return newPages;
      }
    
    this.parseTimestamp = function(timestamp, pageTitle) {
        let timeDate = timestamp.split("T");
        let date = timeDate[0].split("-");
        let time = timeDate[1].split(":");
        let hour = parseInt(time[0]);
        let oldHour = hour;
        let period = "";
        if((hour-12) < 0) {
          period = "am";
        } else {
          hour = (hour-12);
          period = "pm";
        }
        const ret = {
          year: parseInt(date[0]), month: parseInt(date[1]), day: parseInt(date[2]),
          hour: hour, period: period, minute: parseInt(time[1]), "24hour": oldHour,
          second: time[2], pretty: `${date[2]}/${date[1]}/`+
                  `${date[0]} @ ${hour}:${time[1]}:${time[2].slice(0,2)}`+
                  `${period}`,
          title: pageTitle
        }
        return ret;
      }
      
    this.randomSamplePages = function(pages, sampleSize){
      let newPages = [];

      if (sampleSize > pages.length){
        return pages;
      }

      while (sampleSize>0){
        var randomnumber = Math.floor(Math.random()*pages.length);
        if (!newPages.includes(pages[randomnumber])){
          newPages.push(pages[randomnumber]);
          sampleSize--;
        }
      }
      return newPages;
    }

    function containsObj(lst, obj) {
      for (idx in lst) {
        if(lst[idx].title == obj.title && lst[idx].year == obj.year) {
          return true;
        }
      }
      return false;
    }

    function randomSelect(titles, size, givenYear) {
      let revisions = [];

      while(size > 0) {
        randTitle = titles[Math.floor(Math.random()*titles.length)];

        obj = {title: randTitle, year: givenYear};
        if(!containsObj(revisions, obj)) {
          revisions.push(obj);
          size--;
        }
      }
      return revisions;
    }

    function getRandomYearIdx(yearLst, year) {
      while(true){
        let rand = Math.floor(Math.random()*yearLst.length);
        if(yearLst[rand] == year) {
          return rand;
        }
      }
    }

    function getObjSum(obj){
      let sum = 0;
      for(idx in obj) {
        sum += obj[idx];
      }
      return sum;
    }

    function getMaxIdx(obj){
      let retIdx = 0;
      for(idx in obj){
        if(obj[idx] > obj[retIdx]){
          retIdx = idx;
        }
      }
      return retIdx;
    }

    this.proportionalPrune = function(json, newSize) {
      let ratio = {2004: 0, 2008: 0, 2012: 0, 2016: 0};
      let toRemove = {2004: 0, 2008: 0, 2012: 0, 2016: 0};
      for(idx in json["year"]) {
        ratio[json["year"][idx]] ++;
      }
      let total = json["year"].length;

      if(newSize >= total) {
        return json;
      }
      //let proportions = [384/5027,1162/5027,1549/5027,1932/5027];

      let proportions = [384/1934, 778/1934, 388/1934, 384/1934];
      console.log(proportions);
      let counter = 0;
      console.log(ratio);
      for(idx in toRemove) {
        toRemove[idx] = ratio[idx] - Math.round(newSize*proportions[counter]);
        counter++;
      }

      if(newSize > total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2008"] --;
      }
      if(newSize > total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2016"] --;
      }
      if(newSize > total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2012"] --;
      }
      if(newSize > total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2004"] --;
      }

      if(newSize < total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2008"] ++;
      }
      if(newSize < total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2016"] ++;
      }
      if(newSize < total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2012"] ++;
      }
      if(newSize < total - getObjSum(toRemove)){
        console.log("1");
        toRemove["2004"] ++;
      }
      console.log(toRemove);

      console.log(toRemove);
      for(idx in toRemove) {
        for(var i=0; i < toRemove[idx]; i++) {
          let rmvIdx = getRandomYearIdx(json["year"],idx);
          for(attr in json) {
            json[attr].splice(rmvIdx, 1);
          }
        }
      }
      return json;
    }

    this.randomPrune = function(json, newSize) {
      while(json["title"].length > newSize) {
        randomRow = Math.floor(Math.random()*json["title"].length);
        for(idx in json) {
          json[idx].splice(randomRow,1);
        }
      }
      return json;
    }

    this.stratifiedRevisions = function(strata, sampleSize) {
      let revisions = [];
      /*let s1r = strata.s1.length;
      let s2r = s1r + strata.s2.length;
      let s3r = s2r + s1r + strata.s3.length;
      let s4r = s3r + s2r + s1r + strata.s4.length;*/

      let s1r = strata.s1.length;
      let s2r = strata.s2.length;
      let s3r = strata.s3.length;
      let s4r = strata.s4.length;

      let total = s1r + s2r + s3r + s4r;

     /* let s1p = s1r / total;
      let s2p = s2r / total;
      let s3p = s3r / total;
      let s4p = s4r / total;*/

      s1p = 384/1934;
      s2p = 778/1934;
      s3p = 388/1934;
      s4p = 384/1934;

      /*let s1Titles = strata.s1;
      let s2Titles = strata.s2.concat(s1Titles);
      let s3Titles = strata.s3.concat(s2Titles);
      let s4Titles = strata.s4.concat(s3Titles);*/
      //console.log(total);console.log(s1r);console.log(s1p);console.log(sampleSize);console.log(Math.round(sampleSize*s1p));
      revisions = revisions.concat(randomSelect(strata.s1, Math.round(sampleSize*s1p), 2004));
      revisions = revisions.concat(randomSelect(strata.s2, Math.round(sampleSize*s2p), 2008));
      revisions = revisions.concat(randomSelect(strata.s3, Math.round(sampleSize*s3p), 2012));
      revisions = revisions.concat(randomSelect(strata.s4, Math.round(sampleSize*s4p), 2016));
      return revisions;
    }

    this.randomRevisions = function(strata, sampleSize) {
      let revisions = [];

      while(sampleSize > 0) {
        randStrataIdx = Math.floor(Math.random()*4)+1;
        randStrata = "s" + randStrataIdx;
        strataYear = 2000 + randStrataIdx*4;
        randArticleIdx = Math.floor(Math.random()*strata[randStrata].length);

        obj = {title: strata[randStrata][randArticleIdx], year: strataYear};
        if(!containsObj(revisions, obj)) {
          revisions.push(obj);
          sampleSize--;
        }
      }
      return revisions;
    }

    this.allRevisions = function(strata) {
      let revisions = [];

      for(key in strata) {
        for(idx in strata[key]) {
          if(key == "s1") {
            revisions.push({title:strata[key][idx],year:2004});
            revisions.push({title:strata[key][idx],year:2008});
            revisions.push({title:strata[key][idx],year:2012});
            revisions.push({title:strata[key][idx],year:2016});
          } else if(key == "s2") {
            revisions.push({title:strata[key][idx],year:2008});
            revisions.push({title:strata[key][idx],year:2012});
            revisions.push({title:strata[key][idx],year:2016});
          } else if(key == "s3") {
            revisions.push({title:strata[key][idx],year:2012});
            revisions.push({title:strata[key][idx],year:2016});
          } else if(key == "s4") {
            revisions.push({title:strata[key][idx],year:2016});
          }
        }
      }
      return revisions;
    }
}

var utils = new Utils();
module.exports = utils;


