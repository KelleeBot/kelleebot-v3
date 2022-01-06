export interface Artwork {
    name: string;
    url: string;
    image_url: string;
    has_fake: boolean;
    fake_image_url: string;
    art_name: string;
    author: string;
    year: string;
    art_style: string;
    description: string;
    buy: number;
    sell: number;
    availability: string;
    authenticity: string;
    width: number;
    length: number;
}

export interface Bug {
    name: string;
    url: string;
    number: number;
    image_url: string;
    render_url: string;
    time: string;
    location: string;
    rarity: string;
    total_catch: number;
    sell_nook: number;
    sell_flick: number;
    tank_width: number;
    tank_length: number;
    catchphrases: string[];
    north: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
    south: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
}

export interface Clothing {
    name: string;
    url: string;
    category: string;
    sell: number;
    variation_total: number;
    vill_equip: boolean;
    seasonality: string;
    version_added: string;
    unlocked: boolean;
    notes: string;
    label_themes: string[];
    styles: string[];
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
    variations: [
        {
            variation: string;
            image_url: string;
            colors: string[];
        }
    ];
}

export interface Fish {
    name: string;
    url: string;
    number: number;
    image_url: string;
    render_url: string;
    time: string;
    location: string;
    shadow_size: string;
    rarity: string;
    total_catch: number;
    sell_nook: number;
    sell_cj: number;
    tank_width: number;
    tank_length: number;
    catchphrases: string[];
    north: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
    south: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
}

export interface Furniture {
    name: string;
    url: string;
    category: string;
    item_series: string;
    item_set: string;
    themes: string[];
    hha_category: string;
    hha_base: number;
    tag: string;
    lucky: boolean;
    lucky_season: string;
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
    sell: number;
    variation_total: number;
    pattern_total: number;
    customizable: boolean;
    custom_kits: number;
    custom_kit_types: string;
    custom_body_part: string;
    custom_pattern_part: string;
    grid_width: number;
    grid_length: number;
    height: number;
    door_decor: boolean;
    version_added: string;
    unlocked: boolean;
    functions: string[];
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    variations: [
        {
            variation: string;
            pattern: string;
            image_url: string;
            colors: string[];
        }
    ];
    notes: string;
}

export interface Interior {
    name: string;
    url: string;
    image_url: string;
    category: string;
    item_series: string;
    item_set: string;
    themes: string[];
    hha_category: string;
    hha_base: number;
    tag: string;
    sell: number;
    version_added: string;
    unlocked: boolean;
    notes: string;
    grid_width: number;
    grid_length: number;
    colors: string[];
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
}

export interface Item {
    name: string;
    url: string;
    image_url: string;
    stack: number;
    hha_base: number;
    sell: number;
    is_fence: boolean;
    material_type: string;
    material_seasonality: string;
    material_sort: number;
    material_name_sort: number;
    material_seasonaility_sort: number;
    edible: false;
    plant_type: string;
    version_added: string;
    unlocked: boolean;
    notes: string;
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
}

export interface Photo {
    name: string;
    url: string;
    category: string;
    sell: number;
    customizable: boolean;
    custom_kits: number;
    custom_body_part: string;
    interactable: boolean;
    version_added: string;
    unlocked: boolean;
    grid_width: number;
    grid_length: number;
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
    variations: [
        {
            variation: string;
            image_url: string;
            colors: string[];
        }
    ];
}

export interface Recipe {
    name: string;
    url: string;
    image_url: string;
    serial_id: number;
    buy: [
        {
            price: number;
            currency: string;
        }
    ];
    sell: number;
    recipes_to_unlock: number;
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    materials: [
        {
            name: string;
            count: number;
        }
    ];
}

export interface Sea {
    name: string;
    url: string;
    number: number;
    image_url: string;
    render_url: string;
    time: string;
    shadow_size: string;
    shadow_movement: string;
    rarity: string;
    total_catch: number;
    sell_nook: number;
    tank_width: number;
    tank_length: number;
    catchphrases: string[];
    north: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
    south: {
        availability_array: [
            {
                months: string;
                time: string;
            }
        ];
        times_by_month: {
            [key: string]: string;
        };
        months: string;
        months_array: number[];
    };
}

export interface Tool {
    name: string;
    url: string;
    uses: number;
    hha_base: number;
    sell: number;
    customizable: boolean;
    custom_kits: number;
    custom_body_part: string;
    version_added: string;
    unlocked: boolean;
    notes: string;
    availability: [
        {
            from: string;
            note: string;
        }
    ];
    buy: [{ price: number; currency: string }];
    variations: [
        {
            variation: string;
            image_url: string;
        }
    ];
}

export interface Villagers {
    name: string;
    url: string;
    alt_name: string;
    title_color: string;
    text_color: string;
    id: string;
    image_url: string;
    species: string;
    personality: string;
    gender: string;
    birthday_month: string;
    birthday_day: string;
    sign: string;
    quote: string;
    phrase: string;
    clothing: string;
    islander: boolean;
    debut: string;
    prev_phrases: string[];
    appearances: string[];
    nh_details: {
        image_url: string;
        photo_url: string;
        icon_url: string;
        quote: string;
        "sub-personality": string;
        catchphrase: string;
        clothing: string;
        clothing_variation: string;
        fav_styles: string[];
        fav_colors: string[];
        hobby: string;
        house_interior_url: string;
        house_exterior_url: string;
        house_wallpaper: string;
        house_flooring: string;
        house_music: string;
        house_music_note: string;
    };
}