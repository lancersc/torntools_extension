requireDatabase().then(() => {
	addXHRListener(event => {
		const { page, xhr } = event.detail;

		const params = new URL(xhr.responseURL).searchParams;

		if (page === "loader2") {
			if (params.get("sid") === "racingActions" &&
				params.get("step") === "partsbuy" &&
				params.get("confirm") === "1") {
				setTimeout(resetUpgrades, 250);
				// showUpgrades();
			}
		}
	})

	upgradeView().then(() => {
		console.log("TT - Racing Upgrades");

		if (!settings.pages.racing.upgrades) return;

		showUpgrades();

		// start checking again when left site
		for (let category of doc.findAll(".categories li")) {
			category.addEventListener("click", () => {
				upgradeView().then(showUpgrades);
			});
		}
	});
});

function upgradeView() {
	return requireElement(".pm-categories-wrap");
}

function showUpgrades() {
	let parts = [];
	for (let item of doc.findAll(".pm-items-wrap .d-wrap .pm-items .unlock")) {
		parts.push(item.getAttribute("data-part"));

		for (let property of item.findAll(".properties")) {
			let statOld = parseInt(property.find(".bar-gray-light-wrap-d").style.width);
			let statNew = parseInt(property.find(".bar-color-wrap-d").style.width);
			let difference = statNew - statOld;

			if (isNaN(difference)) continue;

			const bar = doc.new("span");

			if (difference !== 0) {
				if (property.find(".bar-tpl-wrap").classList.contains("negative")) {
					bar.innerText = `-${difference}%`;
					bar.classList.add("negative");
				} else {
					bar.innerText = `+${difference}%`;
					bar.classList.add("positive");
				}
			} else {
				bar.innerText = `${difference}%`;
			}

			property.find(".name").prepend(bar);
		}
	}

	parts = parts.filter((value, index, self) => self.indexOf(value) === index);
	let needed = [];
	parts.forEach(part => {
		if (doc.find(`.pm-items .bought[data-part="${part}"]`)) return;

		const color = `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`
		needed.push(`<span class="tt-race-upgrade-needed" part="${part}" style="color: ${color};">${part}</span>`);

		let category;
		for (let item of doc.findAll(`.pm-items .unlock[data-part="${part}"]`)) {
			if (!category) category = findParent(item, { class: "pm-items-wrap" }).getAttribute("category");

			item.find(".status").style['background-color'] = color;
			item.find(".status").classList.add("tt-modified");

			item.onmouseenter = () => {
				for (let item of doc.findAll(`.pm-items .unlock`)) {
					if (item.getAttribute("data-part") === part) {
						item.find(".title").style["background-color"] = color;
						item.style.opacity = 1;
					} else {
						item.style.opacity = 0.5;
					}
				}
			};
			item.onmouseleave = () => {
				for (let item of doc.findAll(`.pm-items .unlock`)) {
					if (item.getAttribute("data-part") === part) {
						item.find(".title").style["background-color"] = "";
					}
					item.style.opacity = 1;
				}
			};
		}

		const elCategory = doc.find(`.pm-categories > li[data-category="${category}"]`);
		if (elCategory.find(".tt-race-need-icon")) {
			elCategory.find(".tt-race-need-icon").innerText = parseInt(elCategory.find(".tt-race-need-icon").innerText) + 1;
		} else {
			elCategory.find(".bg-hover").appendChild(doc.new({ type: "div", class: "tt-race-need-icon", text: 1 }));
		}
	})

	doc.find("#racingAdditionalContainer > .info-msg-cont .msg").appendChild(doc.new({
		type: "div",
		html: `
			<p class="tt-race-upgrades">
				<br/>
				<br/>
				${needed.length ? `
				<strong>${needed.length}</strong> part available to upgrade: <strong>${needed.join(", ")}</strong>
				` : "Your car is <strong style='color: #789e0c;'>FULLY UPGRADED</strong>"}
			</p>
		`,
	}));
}

function resetUpgrades() {
	for (let item of doc.findAll(".pm-items-wrap .d-wrap .pm-items .unlock")) {
		const part = item.getAttribute("data-part");
		if (!doc.find(`.pm-items .bought[data-part="${part}"]`)) continue;

		item.find(".status").style['background-color'] = "";
		item.find(".status").classList.remove("tt-modified");
		item.onmouseenter = () => {
		};
		item.onmouseleave = () => {
		};

		for (let item of doc.findAll(`.pm-items .unlock`)) {
			if (item.getAttribute("data-part") === part) {
				item.find(".title").style["background-color"] = "";
			}
			item.style.opacity = 1;
		}

		if (doc.find(`.tt-race-upgrade-needed[part="${part}"]`)) doc.find(`.tt-race-upgrade-needed[part="${part}"]`).remove();
	}
}
