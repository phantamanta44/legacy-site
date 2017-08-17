"use strict";
$(() => {

  $(".input-text").each(function(i, obj) {
    obj = $(obj);
    obj.append($("<input>", {type: "text", required: "", spellcheck: "false"}));
    obj.append($("<label>").text(obj.attr("data-name")));
    obj.append($("<span>"));
  });

  function getInput(ipt) {
    return ipt.children("input").val();
  }

  const sCont = $("#s-container");

  $(".nav-button").click(e => {
    let x = parseInt(e.currentTarget.getAttribute("data-x"), 10) * -100;
    let y = parseInt(e.currentTarget.getAttribute("data-y"), 10) * -100;
    sCont.css("left", `${x}%`);
    sCont.css("top", `${y}%`);
  });

  $(".nav-main").each((i, obj) => {
    obj = $(obj);
    obj.find(".ray-a").css("border-color", obj.attr("data-a"));
    obj.find(".ray-b").css("border-color", obj.attr("data-b"));
    obj.find(".conc-a").attr("stroke", obj.attr("data-a"));
    obj.find(".conc-b").attr("stroke", obj.attr("data-b"));
  });

  const repoUrl = "http://api.github.com/users/phantamanta44/repos?sort=updated&per_page=100&page=";

  function getRepos(pageNum, cb, prev) {
    let repos = prev || [];
    $.ajax({
      url: repoUrl + pageNum,
      beforeSend: req => req.setRequestHeader("Accept", "application/vnd.github.mercy-preview+json"),
      success: dto => {
        repos = repos.concat(dto);
        if (dto.length < 100)
          cb(repos);
        else
          getRepos(pageNum + 1, cb, repos);
      }
    });
  }

  const orgUrl = "https://api.github.com/users/phantamanta44/orgs";

  function getOrgs(cb) {
    $.getJSON(orgUrl, cb);
  }

  const repos = $("#repo-list");
  const repoCache = new Map();
  const repoSearch = $("#repo-search");
  const repoSearchLabel = repoSearch.children("label");

  getRepos(1, dto => {
    $.each(dto, (i, repo) => {
      let id = repo.id, rightElem;
      repo.tags = repo.topics.join(" ");
      repoCache.set(id.toString(), repo);
      repos.append(
        $("<div>", {"class": "repo-entry", "data-id": id}).append(
          $("<div>", {"class": "repo-entry-left"}).append(
            $("<h2>").text(repo.name.toUpperCase())
          )
        ).append(
          $("<div>", {"class": "repo-entry-center"}).append(
            $("<p>").text(repo.description)
          )
        ).append(
          rightElem = $("<div>", {"class": "repo-entry-right"}).append(
            $("<a>", {href: repo.html_url, target: "_blank", rel: "noopener"}).append(
              $("<i>", {"class": "mdi mdi-github-circle"})
            )
          )
        )
      );
      if (!!repo.homepage) {
        rightElem.append(
          $("<a>", {href: repo.homepage, target: "_blank", rel: "noopener"}).append(
            $("<i>", {"class": "mdi mdi-link"})
          )
        )
      }
    });
    repoSearch.on("input", () => {
      let exp = getInput(repoSearch);
      if (!exp) {
        repos.children().removeClass("hidden");
        repoSearchLabel.text("search.");
        repoSearch.removeClass("invalid");
      } else {
        let pattern;
        try {
          pattern = new RegExp(exp, "i");
        } catch (e) {
          repoSearchLabel.text("invalid regex.");
          repoSearch.addClass("invalid");
          return;
        }
        repoSearchLabel.text("search.");
        repoSearch.removeClass("invalid");
        repos.children().each((i, obj) => {
          let repo = repoCache.get(obj.getAttribute("data-id"));
          if (pattern.test(repo.name)
            || pattern.test(repo.description)
            || pattern.test(repo.tags)) {
            $(obj).removeClass("hidden");
          } else {
            $(obj).addClass("hidden");
          }
        });
      }
    });
  });

  const orgs = $("#org-container");

  getOrgs(dto => {
    let deltaAngle = Math.PI * 2 / dto.length;
    let angle = -Math.PI / 2;
    $.each(dto, (i, org) => {
      orgs.append($("<div>", {"class": "org-entry"}).append(
        $("<a>", {href: `https://github.com/${org.login}`, target: "_blank", rel: "noopener"}).append(
          $("<p>", {"class": "org-name"}).text(org.login)
        )
      ).append(
        $("<div>", {"class": "org-icon"}).css("background-image", `url(${org.avatar_url})`)
      ).css("top", `${50 + 30 * Math.sin(angle)}%`)
        .css("left", `${50 + 30 * Math.cos(angle)}%`));
      angle += deltaAngle;
    });
  });

});